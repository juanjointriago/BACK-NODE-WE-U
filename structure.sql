-- Crear base de datos
CREATE DATABASE IF NOT EXISTS weu_database;
USE weu_database;

-- Tabla roles
CREATE TABLE IF NOT EXISTS roles (
  id INT NOT NULL AUTO_INCREMENT,
  rol_name VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  is_deleted BOOLEAN,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla types_asc
CREATE TABLE IF NOT EXISTS types_asc (
  id INT NOT NULL AUTO_INCREMENT,
  asc_name VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  is_deleted BOOLEAN,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla ec_politica_division (divisiones políticas)
CREATE TABLE IF NOT EXISTS ec_politica_division (
  id INT NOT NULL AUTO_INCREMENT,
  id_parent INT,
  name VARCHAR(255),
  code VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_politica_parent FOREIGN KEY (id_parent) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla subzones
CREATE TABLE IF NOT EXISTS subzones (
  id INT NOT NULL AUTO_INCREMENT,
  zone_id INT,
  subs_id INT,
  name VARCHAR(255),
  state BOOLEAN,
  is_deleted BOOLEAN,
  created_at DATETIME,
  updated_at DATETIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_subzone_zone FOREIGN KEY (zone_id) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla users
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  accessed_at DATETIME,
  address VARCHAR(255),
  created_at DATETIME,
  email VARCHAR(255),
  expo_token VARCHAR(255),
  full_name VARCHAR(255),
  identification VARCHAR(255),
  is_active BOOLEAN,
  is_deleted BOOLEAN,
  lat FLOAT,
  lng FLOAT,
  online BOOLEAN,
  is_available BOOLEAN,
  password VARCHAR(255),
  phone VARCHAR(255),
  photo_home VARCHAR(255),
  photo_id_back VARCHAR(255),
  photo_id_front VARCHAR(255),
  photo_profile VARCHAR(255),
  role_id INT,
  type_asc_id INT,
  updated_at DATETIME,
  whatsapp_group VARCHAR(255),
  zone_id INT,
  subzone_id INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_user_type_asc FOREIGN KEY (type_asc_id) REFERENCES types_asc (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_user_zone FOREIGN KEY (zone_id) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_user_subzone FOREIGN KEY (subzone_id) REFERENCES subzones (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT NOT NULL AUTO_INCREMENT,
  num_asc INT,
  num_subzones INT,
  user_id INT,
  payment_method INT,
  total DOUBLE,
  code_sub VARCHAR(255),
  photo_ticket VARCHAR(255),
  date_subscription DATE,
  date_expiration DATE,
  state BOOLEAN,
  is_deleted BOOLEAN,
  updated_at DATETIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla payments
CREATE TABLE IF NOT EXISTS payments (
  id INT NOT NULL AUTO_INCREMENT,
  num_order VARCHAR(255),
  cod_transaction_payment VARCHAR(255),
  payment_method INT,
  subscription_id INT,
  subtotal DOUBLE,
  iva DOUBLE,
  total DOUBLE,
  voucher VARCHAR(255),
  created_at DATETIME,
  detail VARCHAR(255),
  PRIMARY KEY (id),
  CONSTRAINT fk_payment_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla purchased_products
CREATE TABLE IF NOT EXISTS purchased_products (
  id INT NOT NULL AUTO_INCREMENT,
  subscription_id INT,
  units INT,
  price_unit DOUBLE,
  subtotal DOUBLE,
  tax DOUBLE,
  iva DOUBLE,
  total DOUBLE,
  product VARCHAR(255),
  is_deleted BOOLEAN,
  is_active BOOLEAN,
  is_integraded_subscription BOOLEAN,
  created_at DATETIME,
  updated_at DATETIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_purchased_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla polygons
CREATE TABLE IF NOT EXISTS polygons (
  id INT NOT NULL AUTO_INCREMENT,
  subzone_id INT,
  lat DOUBLE,
  lng DOUBLE,
  PRIMARY KEY (id),
  CONSTRAINT fk_polygon_subzone FOREIGN KEY (subzone_id) REFERENCES subzones (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla multipolygons
CREATE TABLE IF NOT EXISTS multipolygons (
  id INT NOT NULL AUTO_INCREMENT,
  ec_politica_division_id INT,
  latitude BOOLEAN,
  longitude BOOLEAN,
  PRIMARY KEY (id),
  CONSTRAINT fk_multipoly_politica FOREIGN KEY (ec_politica_division_id) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT NOT NULL AUTO_INCREMENT,
  body VARCHAR(255),
  created_at DATETIME,
  data VARCHAR(255),
  is_deleted BOOLEAN,
  receiver_id INT,
  sender_id INT,
  title VARCHAR(255),
  type INT,
  updated_at DATETIME,
  viewed BOOLEAN,
  PRIMARY KEY (id),
  CONSTRAINT fk_notification_receiver FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_notification_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla logbooks
CREATE TABLE IF NOT EXISTS logbooks (
  id INT NOT NULL AUTO_INCREMENT,
  created_at DATETIME,
  date_until DATE,
  hour_until TIME,
  is_deleted BOOLEAN,
  status VARCHAR(255),
  updated_at DATETIME,
  user_id INT,
  zone_id INT,
  subzone_id INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_logbook_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_logbook_zone FOREIGN KEY (zone_id) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_logbook_subzone FOREIGN KEY (subzone_id) REFERENCES subzones (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla coords_logbooks
CREATE TABLE IF NOT EXISTS coords_logbooks (
  id INT NOT NULL AUTO_INCREMENT,
  address VARCHAR(255),
  created_at DATETIME,
  is_deleted BOOLEAN,
  lat DOUBLE,
  lng DOUBLE,
  logbook_id INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_coord_logbook FOREIGN KEY (logbook_id) REFERENCES logbooks (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla media_coords_logbooks
CREATE TABLE IF NOT EXISTS media_coords_logbooks (
  id INT NOT NULL AUTO_INCREMENT,
  coord_logbook_id INT,
  created_at DATETIME,
  is_deleted BOOLEAN,
  url VARCHAR(255),
  PRIMARY KEY (id),
  CONSTRAINT fk_media_coords_logbook FOREIGN KEY (coord_logbook_id) REFERENCES coords_logbooks (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla help_requests
CREATE TABLE IF NOT EXISTS help_requests (
  id INT NOT NULL AUTO_INCREMENT,
  address VARCHAR(255),
  agent_id INT,
  cancel_user_id INT,
  created_at DATETIME,
  is_deleted BOOLEAN,
  lat DOUBLE,
  lng DOUBLE,
  status VARCHAR(255),
  updated_at DATETIME,
  user_id INT,
  zone_id INT,
  subzone_id INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_help_agent FOREIGN KEY (agent_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_help_cancel_user FOREIGN KEY (cancel_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_help_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_help_zone FOREIGN KEY (zone_id) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_help_subzone FOREIGN KEY (subzone_id) REFERENCES subzones (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla detail_subAdmin_cities
CREATE TABLE IF NOT EXISTS detail_subAdmin_cities (
  id INT NOT NULL AUTO_INCREMENT,
  created_at DATETIME,
  is_active BOOLEAN,
  is_deleted BOOLEAN,
  updated_at DATETIME,
  user_id INT,
  zone_id INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_detail_subadmin_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_detail_subadmin_zone FOREIGN KEY (zone_id) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla detail_payments
CREATE TABLE IF NOT EXISTS detail_payments (
  id INT NOT NULL AUTO_INCREMENT,
  payment_id INT,
  units INT,
  price_unit DOUBLE,
  subtotal DOUBLE,
  tax DOUBLE,
  iva DOUBLE,
  total DOUBLE,
  item VARCHAR(255),
  is_deleted BOOLEAN,
  is_active BOOLEAN,
  created_at DATETIME,
  updated_at DATETIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_detail_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla complaints
CREATE TABLE IF NOT EXISTS complaints (
  id INT NOT NULL AUTO_INCREMENT,
  address VARCHAR(255),
  agent_id INT,
  cancel_user_id INT,
  created_at DATETIME,
  description VARCHAR(1000),
  is_deleted BOOLEAN,
  lat DOUBLE,
  lng DOUBLE,
  status VARCHAR(255),
  title VARCHAR(255),
  updated_at DATETIME,
  user_id INT,
  zone_id INT,
  subzone_id INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_complaint_agent FOREIGN KEY (agent_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_complaint_cancel_user FOREIGN KEY (cancel_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_complaint_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_complaint_zone FOREIGN KEY (zone_id) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_complaint_subzone FOREIGN KEY (subzone_id) REFERENCES subzones (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla comments
CREATE TABLE IF NOT EXISTS comments (
  id INT NOT NULL AUTO_INCREMENT,
  address VARCHAR(255),
  complaint_id INT,
  created_at DATETIME,
  description VARCHAR(1000),
  is_deleted BOOLEAN,
  lat DOUBLE,
  lng DOUBLE,
  updated_at DATETIME,
  user_id INT,
  zone_id INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_comment_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_comment_zone FOREIGN KEY (zone_id) REFERENCES ec_politica_division (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla media_comments
CREATE TABLE IF NOT EXISTS media_comments (
  id INT NOT NULL AUTO_INCREMENT,
  comment_id INT,
  created_at DATETIME,
  is_deleted BOOLEAN,
  updated_at DATETIME,
  url VARCHAR(255),
  PRIMARY KEY (id),
  CONSTRAINT fk_media_comment FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla media_complaints
CREATE TABLE IF NOT EXISTS media_complaints (
  id INT NOT NULL AUTO_INCREMENT,
  complaint_id INT,
  created_at DATETIME,
  is_deleted BOOLEAN,
  updated_at DATETIME,
  url VARCHAR(255),
  PRIMARY KEY (id),
  CONSTRAINT fk_media_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla code_users
CREATE TABLE IF NOT EXISTS code_users (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(255),
  user_id INT,
  created_at DATETIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_code_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla asc_subscribers
CREATE TABLE IF NOT EXISTS asc_subscribers (
  id INT NOT NULL AUTO_INCREMENT,
  subscriber_id INT,
  asc_id INT,
  subzone_id INT,
  PRIMARY KEY (id),
  CONSTRAINT fk_ascsubscriber_subscriber FOREIGN KEY (subscriber_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_ascsubscriber_asc FOREIGN KEY (asc_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_ascsubscriber_subzone FOREIGN KEY (subzone_id) REFERENCES subzones (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;