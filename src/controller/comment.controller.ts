import { Request, Response } from 'express';
import { customResponse, badResponse } from '../helpers/customResponses';
import Comment from '../models/comments.model';
import Complaint from '../models/complaint.model';
import { generateFileName } from '../helpers/utils';
import MediaComment from '../models/mediaComment.model';
import { Op } from 'sequelize';
import { generateSignedUrlGCS, uploadFileGCS } from '../helpers/gc-storage';
import { getExtension } from '../helpers/upload-file';

export const postComment = async (req: Request, res: Response) => {
  try {
    const { data, address, complaint_id, description, lat, lng, zone_id } = req.body;

    if (data.role_id !== 4) return customResponse(false, res, 401, `Acceso denegado`, null);

    const photos = req.files?.photos;

    if (photos instanceof Array) {
      if (photos.length > 10) return customResponse(false, res, 401, 'Solo puede subir máximo 10 fotos', null);
    }

    const complaint = await Complaint.findOne({
      where: { id: parseInt(complaint_id), status: { [Op.notIn]: ['cancel', 'completed'] } },
      attributes: ['id'],
    });

    if (!complaint) return customResponse(false, res, 404, 'No se encontro la denuncia', null);

    const newComment = await Comment.create({ address, complaint_id: parseInt(complaint_id), description, lat, lng, zone_id, user_id: data.id });

    if (photos) {
      if (photos instanceof Array) {
        for (let p of photos) {
          const extension = getExtension(p);
          const nameFile = `comment_${data.identification}_${generateFileName()}`;
          await uploadFileGCS(p, nameFile, 'comments');
          await MediaComment.create({ comment_id: newComment.get().id, url: `${nameFile}.${extension}` });
        }
      } else {
        const extension = getExtension(photos);
        const nameFile = `comment_${data.identification}_${generateFileName()}`;
        await uploadFileGCS(photos, nameFile, 'comments');
        await MediaComment.create({ comment_id: newComment.get().id, url: `${nameFile}.${extension}` });
      }
    }

    const comment = await getCommentsById(newComment.get().id);

    customResponse(true, res, 200, 'Comentario creado', comment);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getCommentsByIdComplaint = async (req: Request, res: Response) => {
  try {
    const { idComplaint } = req.params;

    const comments = await Comment.findAndCountAll({
      where: {
        complaint_id: idComplaint,
        is_deleted: 0,
      },
      attributes: ['id', 'address', 'created_at', 'description'],
      include: [
        {
          model: MediaComment,
          attributes: ['url'],
        },
      ],
    });

    for (const comment of comments.rows) {
      for (const media of comment.get().media_comments) {
        media.url = await generateSignedUrlGCS(media.url, 'comments');
      }
    }

    customResponse(true, res, 200, comments.count > 0 ? 'Comentarios encontrados' : 'No existen comentarios', comments);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getCommentsById = async (id: number) => {
  try {
    const comment = await Comment.findOne({
      where: {
        id,
        is_deleted: 0,
      },
      attributes: ['id', 'complaint_id', 'address', 'created_at', 'description', 'lat', 'lng', 'zone_id', 'user_id'],
      include: [
        {
          model: MediaComment,
          attributes: ['url'],
        },
      ],
    });

    if (!comment) return {};

    for (const media of comment.get().media_comments) {
      media.url = await generateSignedUrlGCS(media.url, 'comments');
    }

    return comment;
  } catch (error) {
    console.error('---->', error);
    return {};
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { idComment } = req.params;

    const comment = await Comment.findOne({
      where: {
        id: idComment,
        is_deleted: 0,
      },
      attributes: ['id'],
    });

    await comment?.update({ is_deleted: 1 });

    customResponse(true, res, 200, 'Comentarios eliminado', comment);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};
