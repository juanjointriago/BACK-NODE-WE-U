import { Request, Response } from 'express';
import { badResponse, customResponse } from '../helpers/customResponses';
import axios, { AxiosRequestConfig } from 'axios';
import { COMPONENTS, KEY_MAPS, LANGUAGE } from '../config/config';

const urlGoogleMaps = 'https://maps.googleapis.com/maps/api';

/**
 * Retrieves predictions from the Google Maps API based on the provided input.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
export const getPredictionsGoogleMaps = async (req: Request, res: Response) => {
  try {
    const { input } = req.params;

    // Prepare the request configuration
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${urlGoogleMaps}/place/autocomplete/json?input=${input}&key=${KEY_MAPS}&language=${LANGUAGE}&components=${COMPONENTS}`,
    };

    // Send the request to the Google Maps API
    const resp = await axios(config);

    // Handle error responses from the API
    if (resp.data.status !== 'OK') return customResponse(false, res, 500, 'Ha ocurrido un error, vuelva a intentarlo', resp.data);

    // Format and send the successful response
    customResponse(
      true,
      res,
      200,
      'Direcciones obtenidas',
      resp.data.predictions.map((prediction: any) => ({
        description: prediction.description,
        placeid: prediction.place_id,
      }))
    );
  } catch (error) {
    console.error('--->', error);

    // Send a generic error response
    badResponse(res);
  }
};

/**
 * Retrieves the location geometry from Google Maps API based on a place ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The location geometry if successful, or an error response if not.
 */
export const getGeometryLocationGoogleMaps = async (req: Request, res: Response) => {
  try {
    const { placeid } = req.params;

    // Set up the API request config
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${urlGoogleMaps}/place/details/json?placeid=${placeid}&key=${KEY_MAPS}`,
    };

    // Send the API request
    const resp = await axios(config);

    // Check for errors in the API response
    if (resp.data.status !== 'OK') return customResponse(false, res, 500, 'Ha ocurrido un error, vuelva a intentarlo', resp.data);

    // Return the location geometry
    customResponse(true, res, 200, 'Locación obtenida', resp.data.result.geometry.location);
  } catch (error) {
    console.error('--->', error);
    badResponse(res);
  }
};

/**
 * Retrieves the geocode from Google Maps API based on latitude and longitude.
 * @param req - The request object containing latitude and longitude parameters.
 * @param res - The response object to send the geocode data or error message.
 */
export const getGeoCodeGoogleMaps = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.params;

    // Set up the API request config
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${urlGoogleMaps}/geocode/json?latlng=${lat},${lng}&key=${KEY_MAPS}`,
    };

    // Send the API request
    const resp = await axios(config);

    // Check if the response status is not OK
    if (resp.data.status !== 'OK') return customResponse(false, res, 500, 'Ha ocurrido un error, vuelva a intentarlo', resp.data);

    // Get province from result
    const province = resp.data.results[0].address_components.find((component: any) => component.types.includes('administrative_area_level_1'));
    const city = resp.data.results[0].address_components.find((component: any) => component.types.includes('administrative_area_level_2'));

    // Send the formatted address as the geocode response
    customResponse(true, res, 200, 'Dirección obtenida', { province: province ? province.long_name : '', canton: city ? city.long_name : '', address: resp.data.results[0].formatted_address, location: resp.data.results[0].geometry.location });
  } catch (error) {
    console.error('--->', error);
    badResponse(res);
  }
};
