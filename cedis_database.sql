-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 17, 2025 at 02:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cedis_database`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `insertar_insumos` (IN `inicio` INT, IN `fin` INT)   BEGIN
    DECLARE CONTADOR INT DEFAULT inicio;
    DECLARE cedula_prov VARCHAR(255);

    DECLARE cur CURSOR FOR
        SELECT cedula_prov FROM proveedores_proveedores ORDER BY RAND() LIMIT 1;
    
    abrir_cursor: LOOP
        OPEN cur;
        FETCH cur INTO cedula_prov;

        iterar: WHILE CONTADOR <= fin DO
            INSERT INTO insumos_productos (codigo, nombrep, cantidad, cedula_prov, descripcion)
            VALUES (
                CONCAT('COD', LPAD(CONTADOR, 5, '0')),
                CONCAT('Producto', CONTADOR),
                CONTADOR * 10,
                cedula_prov,
                CONCAT('Descripción del producto ', CONTADOR)
            );
            SET CONTADOR = CONTADOR + 1;
        END WHILE iterar;
        CLOSE cur;
        LEAVE abrir_cursor; -- Salir del bucle de cursor
    END LOOP abrir_cursor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertar_pacientes` ()   BEGIN
    DECLARE i INT DEFAULT 200000;

    WHILE i <= 350000 DO
        INSERT INTO paciente (
            id, paciente_nombres, paciente_apepaterno, paciente_apematerno, paciente_dni, 
            paciente_celular, paciente_sexo, fecha_nacimiento, date_joined
        )
        VALUES (
            i,
            CONCAT('Nombre', i),
            CONCAT('ApellidoPaterno', i),
            CONCAT('ApellidoMaterno', i),
            LPAD(CAST(i AS CHAR(8)), 8, '0'),
            '1234567890',
            CASE WHEN (i % 2) = 0 THEN 'M' ELSE 'F' END,
            DATE_ADD('1990-01-01', INTERVAL (i % 365) DAY),
            NOW()
        );
        SET i = i + 1;
    END WHILE;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `listar_especialidades` ()   BEGIN
  SELECT 
    e.especialidad_id,
    e.especialidad_nombre,
    e.especialidad_fregistro,
    e.especialidad_estatus
  FROM 
    especialidad e;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `listar_medicos` ()   BEGIN
  SELECT 
    m.medico_id,
    CONCAT(m.medico_apepat, ' ', m.medico_apemat, ' ', m.medico_nombre) AS medico,
    m.medico_direccion,
    m.medico_movil,
    m.medico_fenac,
    m.medico_nrodocumento,
    e.especialidad_nombre
  FROM 
    medico m
  JOIN 
    especialidad e ON m.especialidad_id = e.especialidad_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `modificar_usuario` (IN `p_id` INT, IN `p_email` VARCHAR(255), IN `p_rol` INT)   BEGIN
    UPDATE usuario
    SET email = p_email,  -- Aquí `email` es la columna de la tabla y `p_email` es una variable
        rol_id = p_rol    -- Aquí `rol_id` es la columna de la tabla y `p_rol` es una variable
    WHERE id = p_id;      -- Aquí `id` es la columna de la tabla y `p_id` es una variable
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_examenes_pendientes` ()   BEGIN
    SELECT 
        realizar_examen.id AS realizar_examen_id,
        realizar_examen.paciente_id_id AS realizar_examen_paciente_id_id,
        paciente.paciente_nombres,
        paciente.paciente_apepaterno,
        paciente.paciente_dni,
        paciente.fecha_nacimiento,
        realizar_examen.realizarexamen_estatus,
        realizar_examen.medico_id_id AS realizar_examen_medico_id_id,
        medico.medico_nombre,
        medico.medico_apepat,
        medico.medico_nrodocumento
    FROM 
        realizar_examen
    INNER JOIN
        paciente
    ON 
        realizar_examen.paciente_id_id = paciente.id
    INNER JOIN
        medico
    ON 
        realizar_examen.medico_id_id = medico.medico_id
    WHERE realizar_examen.realizarexamen_estatus = 'PENDIENTE';
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_detalle_realizar_examen` (IN `p_id` INT)   BEGIN
    DELETE FROM realizar_examen_detalle WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_analisis` ()   BEGIN
    SELECT
        analisis.analisis_id, 
        analisis.analisis_nombre, 
        analisis.analisis_fregistro, 
        analisis.analisis_estatus
    FROM
        analisis;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_detalle_analisis_resultado` (IN `p_idexamen` INT)   BEGIN
    SELECT 
        realizar_examen_detalle.id AS realizar_examen_detalle_id,
        realizar_examen_detalle.examen_id AS realizar_examen_detalle_examen_id,
        realizar_examen_detalle.analisis_id AS realizar_examen_detalle_analisis_id,
        examen.examen_nombre AS examen_nombre,
        analisis.analisis_nombre AS analisis_nombre
    FROM 
        realizar_examen_detalle
    INNER JOIN
        analisis
    ON 
        realizar_examen_detalle.analisis_id = analisis.id
    INNER JOIN
        examen
    ON 
        realizar_examen_detalle.examen_id = examen.id
    WHERE 
        realizar_examen_detalle.realizarexamen_id = p_idexamen;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_examen` ()   BEGIN
    SELECT
        examen.id AS examen_id, 
        CAST(examen.examen_nombre AS CHAR) AS examen_nombre,  -- Convertir a text
        CAST(analisis.analisis_nombre AS CHAR) AS analisis_nombre,  -- Convertir a text
        CAST(examen.examen_fregistro AS DATETIME) AS examen_fregistro,  -- Convertir a timestamp
        CAST(examen.examen_estatus AS CHAR) AS examen_estatus,  -- Convertir a text
        examen.analisis_id_id AS analisis_id
    FROM
        examen
    INNER JOIN
        analisis
    ON 
        examen.analisis_id_id = analisis.id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_notificaciones` ()   BEGIN
  SELECT 
    CONCAT_WS(' ', paciente.paciente_apepaterno, paciente.paciente_nombres) AS paciente_nombre,
    realizar_examen.realizarexamen_fregistro AS realizar_examen_fregistro,
    CONCAT_WS(' ', medico.medico_apepat, medico.medico_apemat, medico.medico_nombre) AS medico_nombre
  FROM realizar_examen
  INNER JOIN paciente ON realizar_examen.paciente_id_id = paciente.id
  INNER JOIN medico ON realizar_examen.medico_id_id = medico.medico_id
  WHERE realizar_examen.realizarexamen_estatus = 'PENDIENTE';
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_resultado_detalle_editar` (IN `P_ID` INT)   BEGIN
    SELECT
        CAST(analisis.analisis_nombre AS CHAR) AS analisis_nombre,  -- Convertir a text
        CAST(examen.examen_nombre AS CHAR) AS examen_nombre,  -- Convertir a text
        CAST(resultado_detalle.resuldetalle_archivo AS CHAR) AS resuldetalle_archivo,
        resultado_detalle.id AS resultado_detalle_id,  -- Convertir a integer
        resultado_detalle.resultado_id AS resultado_id  -- Convertir a integer
    FROM
        resultado_detalle
    INNER JOIN
        realizar_examen_detalle
    ON
        resultado_detalle.rdetalle_id = realizar_examen_detalle.id
    INNER JOIN
        analisis
    ON
        realizar_examen_detalle.analisis_id = analisis.id
    INNER JOIN
        examen
    ON
        realizar_examen_detalle.examen_id = examen.id
    WHERE
        resultado_detalle.resultado_id = P_ID;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_resultado_examen` ()   BEGIN
    SELECT 
        resultado.id AS resultado_id,
        CONCAT_WS(' ', paciente.paciente_apepaterno, paciente.paciente_nombres) AS paciente,
        paciente.paciente_dni,
        usuario.username,
        resultado.resultado_fregistro AS resultado_fregistro,
        CAST(resultado.resultado_estatus AS CHAR) AS resultado_estatus  -- Conversión explícita a CHAR
    FROM 
        resultado
    INNER JOIN
        usuario ON resultado.usuario_id_id = usuario.id
    INNER JOIN 
        realizar_examen ON resultado.realizarexamen_id_id = realizar_examen.id
    INNER JOIN
        paciente ON realizar_examen.paciente_id_id = paciente.id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_select_analisis` ()   BEGIN
    SELECT 
        analisis_id, 
        analisis_nombre 
    FROM 
        analisis 
    WHERE 
        analisis_estatus = 'ACTIVO';
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_select_rol` ()   BEGIN
    SELECT * FROM rol;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_usuario` ()   BEGIN
    SELECT
        usuario.id,
        usuario.username,
        usuario.password,
        usuario.rol_id,
        usuario.usu_status,
        usuario.email,
        usuario.picture,
        rol.rol_nombre
    FROM
        usuario
    INNER JOIN
        rol ON usuario.rol_id = rol.rol_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_modificar_analisis` (IN `p_id` INT, IN `p_analisis` VARCHAR(100), IN `p_estatus` VARCHAR(50), OUT `resultado` INT)   BEGIN
    DECLARE ANALISISACTUAL VARCHAR(100);
    DECLARE CANTIDAD INT;

    SELECT analisis_nombre INTO ANALISISACTUAL FROM analisis WHERE analisis_id = p_id;

    IF ANALISISACTUAL = p_analisis THEN
        UPDATE analisis SET
            analisis_nombre = p_analisis,
            analisis_estatus = p_estatus
        WHERE analisis_id = p_id;
        SET resultado = 1;
    ELSE
        SELECT COUNT(*) INTO CANTIDAD FROM analisis WHERE analisis_nombre = p_analisis;
        IF CANTIDAD = 0 THEN
            UPDATE analisis SET
                analisis_nombre = p_analisis,
                analisis_estatus = p_estatus
            WHERE analisis_id = p_id;
            SET resultado = 1;
        ELSE
            SET resultado = 2;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_modificar_examen` (IN `p_examen_id` INT, IN `p_examen_nombre` VARCHAR(100), IN `p_analisis_id` INT, IN `p_examen_estatus` VARCHAR(255), OUT `resultado` INT)   BEGIN
    DECLARE cantidad INT;

    -- Verificar si el nombre del examen ya existe en el mismo análisis (sin distinción de mayúsculas o minúsculas)
    SELECT COUNT(*) INTO cantidad 
    FROM examen 
    WHERE LOWER(examen_nombre) = LOWER(p_examen_nombre)
    AND analisis_id_id = p_analisis_id
    AND id != p_examen_id;

    IF cantidad = 0 THEN
        UPDATE examen
        SET examen_nombre = p_examen_nombre,
            analisis_id_id = p_analisis_id,
            examen_estatus = p_examen_estatus,
            examen_fregistro = CURRENT_DATE
        WHERE id = p_examen_id;
        SET resultado = 1;
    ELSE
        SET resultado = 2;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_modificar_rol` (IN `p_id` INT, IN `p_rol` VARCHAR(25), IN `p_estatus` VARCHAR(50), OUT `resultado` INT)   BEGIN
    DECLARE cantidad INT;
    DECLARE rol_actual VARCHAR(25);

    SELECT rol_nombre INTO rol_actual FROM rol WHERE rol_id = p_id;
    
    IF rol_actual = p_rol THEN
        UPDATE rol 
        SET rol_nombre = p_rol,
            rol_estatus = p_estatus
        WHERE rol_id = p_id;
        SET resultado = 1;
    ELSE
        SELECT COUNT(*) INTO cantidad FROM rol WHERE rol_nombre = p_rol;
        IF cantidad = 0 THEN
            UPDATE rol 
            SET rol_nombre = p_rol,
                rol_estatus = p_estatus
            WHERE rol_id = p_id;
            SET resultado = 1;
        ELSE
            SET resultado = 2;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_modificar_usuario_estatus` (IN `p_id` INT, IN `p_estatus` VARCHAR(50))   BEGIN
    UPDATE usuario
    SET usu_status = p_estatus
    WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_analis` (IN `p_analisis` VARCHAR(100), OUT `resultado` INT)   BEGIN
    DECLARE cantidad INT;

    SELECT COUNT(*) INTO cantidad FROM analisis WHERE analisis_nombre = p_analisis;

    IF cantidad = 0 THEN
        INSERT INTO analisis (analisis_nombre, analisis_fregistro, analisis_estatus)
        VALUES (p_analisis, CURRENT_DATE, 'ACTIVO');
        SET resultado = 1;
    ELSE
        SET resultado = 2;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_detalle_realizar_examen` (IN `p_realizarexamen_id` INT, IN `p_examen_id` INT, IN `p_analisis_id` INT)   BEGIN
    INSERT INTO realizar_examen_detalle (realizarexamen_id, examen_id, analisis_id)
    VALUES (p_realizarexamen_id, p_examen_id, p_analisis_id);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_examen` (IN `p_examen` VARCHAR(100), IN `p_idanalisis` INT, OUT `resultado` INT)   BEGIN
    DECLARE cantidad INT;

    -- Verificar si el nombre del examen ya existe en el mismo análisis (sin distinción de mayúsculas o minúsculas)
    SELECT COUNT(*) INTO cantidad 
    FROM examen 
    WHERE LOWER(examen_nombre) = LOWER(p_examen)
    AND analisis_id_id = p_idanalisis;

    IF cantidad = 0 THEN
        INSERT INTO examen (examen_nombre, analisis_id_id, examen_fregistro, examen_estatus)
        VALUES (p_examen, p_idanalisis, CURRENT_DATE, 'ACTIVO');
        SET resultado = 1;  -- Devolver 1 si la inserción fue exitosa
    ELSE
        SET resultado = 2;  -- Devolver 2 si el examen ya existe
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_realizar_examen` (IN `p_idpaciente` INT, IN `p_idusuario` INT, IN `p_idmedico` INT, OUT `new_id` INT)   BEGIN
    INSERT INTO realizar_examen (paciente_id_id, usuario_id_id, realizarexamen_estatus, medico_id_id, realizarexamen_fregistro)
    VALUES (p_idpaciente, p_idusuario, 'PENDIENTE', p_idmedico, CURRENT_DATE);
    
    SET new_id = LAST_INSERT_ID();  -- Obtener el último ID insertado
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_resultado_detalle` (IN `p_idresultado` INT, IN `p_idrealizarexamen` INT, IN `p_resuldetalle_archivo` VARCHAR(255))   BEGIN
    -- Intentar insertar los datos
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Manejar la excepción
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error al insertar';
    END;
    
    INSERT INTO resultado_detalle (resultado_id, rdetalle_id, resuldetalle_archivo)
    VALUES (p_idresultado, p_idrealizarexamen, p_resuldetalle_archivo);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_resultado_examen` (IN `p_idusuario` INT, IN `p_idrealizarexamen` INT, OUT `p_resultado_id` INT)   BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Manejar la excepción
        SET p_resultado_id = NULL;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error al insertar';
    END;
    
    -- Inserción en la tabla resultado
    INSERT INTO resultado (
        usuario_id_id, 
        resultado_fregistro, 
        resultado_estatus, 
        realizarexamen_id_id
    ) VALUES (
        p_idusuario, 
        CURRENT_DATE, 
        '1', 
        p_idrealizarexamen
    );
    
    -- Obtener el id del resultado recién creado
    SET p_resultado_id = LAST_INSERT_ID();
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_rol` (IN `p_rol_nombre` VARCHAR(100), OUT `resultado` INT)   BEGIN
    DECLARE cantidad INT;

    -- Verificar si el rol ya existe
    SELECT COUNT(*) INTO cantidad FROM rol WHERE rol_nombre = p_rol_nombre;

    IF cantidad = 0 THEN
        INSERT INTO rol (rol_nombre, rol_fregistro, rol_estatus)
        VALUES (p_rol_nombre, CURRENT_DATE, 'ACTIVO');
        SET resultado = 1;
    ELSE
        SET resultado = 2;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_usuario` (IN `p_usuario` VARCHAR(100), IN `p_contra` VARCHAR(255), IN `p_rol` INT, IN `p_email` VARCHAR(100), IN `p_ruta` VARCHAR(255), OUT `resultado` INT)   BEGIN
    DECLARE v_cantidad INT;

    SELECT COUNT(*) INTO v_cantidad FROM usuario WHERE username = p_usuario;

    IF v_cantidad = 0 THEN
        INSERT INTO usuario (
            username, 
            password, 
            rol_id, 
            usu_status, 
            email, 
            is_superuser, 
            first_name, 
            last_name, 
            is_staff, 
            is_active, 
            date_joined, 
            picture, 
            location, 
            bio
        ) VALUES (
            p_usuario, 
            p_contra, 
            p_rol, 
            'ACTIVO', 
            p_email, 
            false,  -- is_superuser
            '',     -- first_name
            '',     -- last_name
            false,  -- is_staff
            true,   -- is_active
            NOW(),  -- date_joined
            p_ruta, 
            '',     -- location
            ''      -- bio
        );
        SET resultado = 1;
    ELSE
        SET resultado = 2;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_verificar_usuario` (IN `p_usuario_input` VARCHAR(100))   BEGIN
    SELECT
        usuario.id, 
        usuario.username, 
        usuario.password, 
        usuario.rol_id, 
        usuario.usu_status, 
        usuario.email, 
        usuario.picture, 
        rol.rol_nombre
    FROM
        usuario
    INNER JOIN
        rol
    ON 
        usuario.rol_id = rol.rol_id
    WHERE 
        usuario.username = p_usuario_input; -- usa "username" en lugar de "usu_nombre"
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ver_detalle_realizar_examen` (IN `p_id` INT)   BEGIN
    SELECT 
        realizar_examen_detalle.id AS realizar_examen_detalle_id,
        realizar_examen_detalle.examen_id AS realizar_examen_detalle_examen_id,
        realizar_examen_detalle.analisis_id AS realizar_examen_detalle_analisis_id,
        realizar_examen_detalle.realizarexamen_id AS realizar_examen_detalle_realizarexamen_id,
        examen.examen_nombre AS examen_nombre,
        analisis.analisis_nombre AS analisis_nombre
    FROM
        realizar_examen_detalle
    INNER JOIN
        examen ON realizar_examen_detalle.examen_id = examen.id
    INNER JOIN
        analisis ON realizar_examen_detalle.analisis_id = analisis.id
    WHERE 
        realizar_examen_detalle.realizarexamen_id = p_id;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_editar_detalle_examen` (`P_ID` INT, `IDANALISIS` INT, `IDEXAMEN` INT) RETURNS INT(11) DETERMINISTIC BEGIN
  DECLARE CANTIDAD INT;
  DECLARE resultado INT;

  SELECT COUNT(*) INTO CANTIDAD 
  FROM realizar_examen_detalle 
  WHERE realizarexamen_id = P_ID AND analisis_id = IDANALISIS AND examen_id = IDEXAMEN;

  IF CANTIDAD = 0 THEN
    INSERT INTO realizar_examen_detalle(realizarexamen_id, analisis_id, examen_id) 
    VALUES(P_ID, IDANALISIS, IDEXAMEN);
    SET resultado = 1;
  ELSE
    SET resultado = 2;
  END IF;

  RETURN resultado;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `analisis`
--
-- Creation: Jan 23, 2025 at 09:38 PM
--

CREATE TABLE `analisis` (
  `id` bigint(20) NOT NULL,
  `analisis_nombre` varchar(100) DEFAULT NULL,
  `analisis_fregistro` date DEFAULT NULL,
  `analisis_estatus` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `analisis`
--

INSERT INTO `analisis` (`id`, `analisis_nombre`, `analisis_fregistro`, `analisis_estatus`) VALUES
(1, 'HEMATOLOGÍA', '2025-01-23', 'ACTIVO');

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add Usuario', 6, 'add_profile'),
(22, 'Can change Usuario', 6, 'change_profile'),
(23, 'Can delete Usuario', 6, 'delete_profile'),
(24, 'Can view Usuario', 6, 'view_profile'),
(25, 'Can add Rol', 7, 'add_rol'),
(26, 'Can change Rol', 7, 'change_rol'),
(27, 'Can delete Rol', 7, 'delete_rol'),
(28, 'Can view Rol', 7, 'view_rol'),
(29, 'Can add Paciente', 8, 'add_paciente'),
(30, 'Can change Paciente', 8, 'change_paciente'),
(31, 'Can delete Paciente', 8, 'delete_paciente'),
(32, 'Can view Paciente', 8, 'view_paciente'),
(33, 'Can add productos', 9, 'add_productos'),
(34, 'Can change productos', 9, 'change_productos'),
(35, 'Can delete productos', 9, 'delete_productos'),
(36, 'Can view productos', 9, 'view_productos'),
(37, 'Can add analisis', 10, 'add_analisis'),
(38, 'Can change analisis', 10, 'change_analisis'),
(39, 'Can delete analisis', 10, 'delete_analisis'),
(40, 'Can view analisis', 10, 'view_analisis'),
(41, 'Can add examen', 11, 'add_examen'),
(42, 'Can change examen', 11, 'change_examen'),
(43, 'Can delete examen', 11, 'delete_examen'),
(44, 'Can view examen', 11, 'view_examen'),
(45, 'Can add realizar examen', 12, 'add_realizarexamen'),
(46, 'Can change realizar examen', 12, 'change_realizarexamen'),
(47, 'Can delete realizar examen', 12, 'delete_realizarexamen'),
(48, 'Can view realizar examen', 12, 'view_realizarexamen'),
(49, 'Can add realizar examen detalle', 13, 'add_realizarexamendetalle'),
(50, 'Can change realizar examen detalle', 13, 'change_realizarexamendetalle'),
(51, 'Can delete realizar examen detalle', 13, 'delete_realizarexamendetalle'),
(52, 'Can view realizar examen detalle', 13, 'view_realizarexamendetalle'),
(53, 'Can add resultado', 14, 'add_resultado'),
(54, 'Can change resultado', 14, 'change_resultado'),
(55, 'Can delete resultado', 14, 'delete_resultado'),
(56, 'Can view resultado', 14, 'view_resultado'),
(57, 'Can add resultado detalle', 15, 'add_resultadodetalle'),
(58, 'Can change resultado detalle', 15, 'change_resultadodetalle'),
(59, 'Can delete resultado detalle', 15, 'delete_resultadodetalle'),
(60, 'Can view resultado detalle', 15, 'view_resultadodetalle'),
(61, 'Can add Especialidad', 16, 'add_especialidad'),
(62, 'Can change Especialidad', 16, 'change_especialidad'),
(63, 'Can delete Especialidad', 16, 'delete_especialidad'),
(64, 'Can view Especialidad', 16, 'view_especialidad'),
(65, 'Can add Médico', 17, 'add_medico'),
(66, 'Can change Médico', 17, 'change_medico'),
(67, 'Can delete Médico', 17, 'delete_medico'),
(68, 'Can view Médico', 17, 'view_medico'),
(69, 'Can add proveedores', 18, 'add_proveedores'),
(70, 'Can change proveedores', 18, 'change_proveedores'),
(71, 'Can delete proveedores', 18, 'delete_proveedores'),
(72, 'Can view proveedores', 18, 'view_proveedores');

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(4, '2024-12-04 13:28:19.860708', '5', 'sagitta_luminis', 2, '[{\"changed\": {\"fields\": [\"Staff status\"]}}]', 5, 1),
(5, '2024-12-04 13:29:02.544076', '1', 'Cliente', 3, '', 2, 1),
(6, '2024-12-04 13:45:53.830845', '1', 'maria13', 2, '[{\"changed\": {\"fields\": [\"Picture\"]}}]', 5, 1),
(7, '2024-12-04 13:46:42.912705', '3', 'scythe', 2, '[{\"changed\": {\"fields\": [\"Picture\"]}}]', 5, 1);

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--
-- Creation: Jan 23, 2025 at 09:38 PM
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(6, 'adminlite', 'profile'),
(7, 'adminlite', 'rol'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'contenttypes', 'contenttype'),
(10, 'examenes', 'analisis'),
(16, 'examenes', 'especialidad'),
(11, 'examenes', 'examen'),
(17, 'examenes', 'medico'),
(12, 'examenes', 'realizarexamen'),
(13, 'examenes', 'realizarexamendetalle'),
(14, 'examenes', 'resultado'),
(15, 'examenes', 'resultadodetalle'),
(9, 'insumos', 'productos'),
(8, 'pacientes', 'paciente'),
(18, 'proveedores', 'proveedores'),
(5, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--
-- Creation: Jan 23, 2025 at 09:38 PM
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-01-23 21:38:05.051430'),
(2, 'contenttypes', '0002_remove_content_type_name', '2025-01-23 21:38:05.086353'),
(3, 'auth', '0001_initial', '2025-01-23 21:38:05.224211'),
(4, 'auth', '0002_alter_permission_name_max_length', '2025-01-23 21:38:05.252679'),
(5, 'auth', '0003_alter_user_email_max_length', '2025-01-23 21:38:05.260819'),
(6, 'auth', '0004_alter_user_username_opts', '2025-01-23 21:38:05.264929'),
(7, 'auth', '0005_alter_user_last_login_null', '2025-01-23 21:38:05.270935'),
(8, 'auth', '0006_require_contenttypes_0002', '2025-01-23 21:38:05.275083'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2025-01-23 21:38:05.283078'),
(10, 'auth', '0008_alter_user_username_max_length', '2025-01-23 21:38:05.289414'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2025-01-23 21:38:05.294046'),
(12, 'auth', '0010_alter_group_name_max_length', '2025-01-23 21:38:05.304811'),
(13, 'auth', '0011_update_proxy_permissions', '2025-01-23 21:38:05.311036'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2025-01-23 21:38:05.316153'),
(15, 'adminlite', '0001_initial', '2025-01-23 21:38:05.486890'),
(16, 'admin', '0001_initial', '2025-01-23 21:38:05.553920'),
(17, 'admin', '0002_logentry_remove_auto_add', '2025-01-23 21:38:05.561044'),
(18, 'admin', '0003_logentry_add_action_flag_choices', '2025-01-23 21:38:05.568330'),
(19, 'adminlite', '0002_rol_alter_profile_options_profile_usu_status_and_more', '2025-01-23 21:38:05.644134'),
(20, 'adminlite', '0003_profile_old_picture', '2025-01-23 21:38:05.655131'),
(21, 'adminlite', '0004_remove_profile_old_picture', '2025-01-23 21:38:05.666540'),
(22, 'pacientes', '0001_initial', '2025-01-23 21:38:05.674846'),
(23, 'pacientes', '0002_alter_paciente_options_and_more', '2025-01-23 21:38:05.689283'),
(24, 'pacientes', '0003_alter_paciente_options_remove_paciente_unique_dni_and_more', '2025-01-23 21:38:05.718053'),
(25, 'pacientes', '0004_remove_paciente_paciente_edad_and_more', '2025-01-23 21:38:05.733106'),
(26, 'pacientes', '0005_alter_paciente_paciente_celular', '2025-01-23 21:38:05.739940'),
(27, 'pacientes', '0006_alter_paciente_paciente_celular_and_more', '2025-01-23 21:38:05.753024'),
(28, 'pacientes', '0007_paciente_date_joined', '2025-01-23 21:38:05.764947'),
(29, 'pacientes', '0008_alter_paciente_paciente_sexo', '2025-01-23 21:38:05.767709'),
(30, 'examenes', '0001_initial', '2025-01-23 21:38:06.046610'),
(31, 'examenes', '0002_especialidad_medico', '2025-01-23 21:38:06.107627'),
(32, 'examenes', '0003_remove_medico_medico_colegiatura', '2025-01-23 21:38:06.121414'),
(33, 'examenes', '0004_alter_medico_medico_nrodocumento', '2025-01-23 21:38:06.137560'),
(34, 'examenes', '0005_remove_realizarexamen_realizar_ex_pacient_d97178_idx_and_more', '2025-01-23 21:38:06.452238'),
(35, 'examenes', '0006_realizarexamen_usuario_id', '2025-01-23 21:38:06.519857'),
(36, 'examenes', '0007_remove_realizarexamen_realizarexamen_nomindica', '2025-01-23 21:38:06.539779'),
(37, 'examenes', '0008_remove_resultado_resultado_pacient_5bbb74_idx_and_more', '2025-01-23 21:38:06.743166'),
(38, 'examenes', '0009_remove_resultado_resultado_pacient_895da5_idx_and_more', '2025-01-23 21:38:06.919405'),
(39, 'examenes', '0010_alter_resultadodetalle_resuldetalle_archivo', '2025-01-23 21:38:06.949463'),
(40, 'proveedores', '0001_initial', '2025-01-23 21:38:06.958346'),
(41, 'proveedores', '0002_proveedores_email', '2025-01-23 21:38:06.969818'),
(42, 'proveedores', '0003_rename_email_proveedores_email_prov', '2025-01-23 21:38:06.979072'),
(43, 'proveedores', '0004_proveedores_date_joined', '2025-01-23 21:38:06.989296'),
(44, 'insumos', '0001_initial', '2025-01-23 21:38:07.069408'),
(45, 'insumos', '0002_productos_descripcion', '2025-01-23 21:38:07.079482'),
(46, 'insumos', '0003_alter_productos_proveedor', '2025-01-23 21:38:07.082797'),
(47, 'sessions', '0001_initial', '2025-01-23 21:38:07.099063');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--
-- Creation: Jan 23, 2025 at 09:38 PM
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('6v4gm2uadxi1zu3a89e7nbi29uvl02vv', '.eJxVjEsLgkAURv_LXctwnUdO7oo2QiEorYc7d6a0QsHHKvrvKbio7Tnn-97gaJ4aN49xcG2AHAwkv8wTP2O3ivCg7t4L7rtpaL1YE7HZUVz6EF_Hrf07aGhslrVGhawV3jC1KCmg11oqksakyCpilGi9CVqGzHNkozgic6bR2J2ivV1Oa1ecrvX1UBUl5CaBqjwvBPL08wXmCz4L:1tb81E:BnhYSEzJ4d4fw3_6dlX6G0E0jxSFKBcrYGchVY44swY', '2025-02-07 00:57:56.285341'),
('98k7dvvcs5k1m54ix8ojjekgzrurrd0h', 'e30:1tUzX6:cgya_H5ePlghwFZZ26IZTszz45djiv9P1dYAo3OdT_I', '2025-01-20 22:41:28.928810'),
('gdysbkj80iqlq5puoinonm6ct1j0skjv', '.eJxVzMsOwiAQheF3YW0IzDC2dem-z0AGBqRqIOllZXx3bdKFrr__nJfyvK3Fb0ua_STqojpDhpw6_ULg-Eh1V7lzvTUdW13nKeg90YcuemySntej_TsovJTvGsAhZkvGpCg5cyDhXgYXAJBwSMH0nbWISGcwTBRZAGwO2DmXHGT1_gCTfThU:1tCnl1:kBwM0yyLzoDUeMBnRb8SsaNH7r40Dip8mcIIcFNyN4M', '2024-12-01 18:28:39.485394'),
('mpvnw8upoe3lv9ah2u4zajon3mo5gczq', 'e30:1tUzL8:t-vQhXZ2_RyMj3ReQWgzZ-nseaUEOhj-myTgS_cuw14', '2025-01-20 22:29:06.653377'),
('u4u4urni4cs7gruxe6fix0em241gdp6m', '.eJxVjMsKgzAUBf8lawnGJDe57lq6EVoExXXIy2pbFHysSv-9Ci7a3WHOMG9i7Lp0Zp3jZPpAcsJI8suc9c847Ed42OE-Uj8Oy9Q7uiv0eGd6G0N8nQ_3L9DZuduzXsfWu4xxwQGECCqGKIKFFlOpUAHnUusMnRdSMUTwqU4RAFE61Mxu0doUl6ZuTlVRkpwlpCqvG9nm5wvyEz2p:1tLrm7:0UGCjCnahFfRapXG1hlxFkK11esaBSaVH7_TjRPQr4w', '2024-12-26 18:35:15.705564'),
('ug79u9i7zzxyl2nupp8o9r715qcgk1x1', '.eJxVjEsLgkAURv_LXctwnUdO7oo2QiEorYc7d6a0QsHHKvrvKbio7Tnn-97gaJ4aN49xcG2AHAwkv8wTP2O3ivCg7t4L7rtpaL1YE7HZUVz6EF_Hrf07aGhslrVGhawV3jC1KCmg11oqksakyCpilGi9CVqGzHNkozgic6bR2J2ivV1Oa1ecrvX1UBUl5CaBqjwvBPL08wXmCz4L:1tgoE9:vwUiws7zLwMd99T91ospL-_noKZv2eHnrFX-8jxQvhE', '2025-02-22 17:02:45.107312'),
('xho05eul76daingnq8ejye0gp4dzal5y', 'e30:1tUzKp:SrVorQXA6tTkJf6mq_gy0SEGc73CS1-IF25hPXK9WT4', '2025-01-20 22:28:47.439218'),
('ymhyqwtt97wn80987gfwv9iffd4l3w71', '.eJxVjLsOAiEQRf-F2hAQGMDS3m_YwMwgqwaSfVTGf3c32UKb25xz7lsMaV3qsM48DSOJi_DKKWfF6RfkhE9uO6VHavcusbdlGrPcFXnQWd468et6uH8HNc11qyEWVOy1YYPKBV9KVoCAeC4cOWcAQxSDDkxEbA1sS94CFwOo0YvPF8msOkI:1tCnMV:gaFugHyakEiJFI0k2QihuxWBwmvfonDOfZWxYtjfNCc', '2024-12-01 18:03:19.391301');

-- --------------------------------------------------------

--
-- Table structure for table `especialidad`
--
-- Creation: Jan 23, 2025 at 09:38 PM
--

CREATE TABLE `especialidad` (
  `especialidad_id` int(11) NOT NULL,
  `especialidad_nombre` varchar(100) DEFAULT NULL,
  `especialidad_fregistro` date DEFAULT NULL,
  `especialidad_estatus` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `especialidad`
--

INSERT INTO `especialidad` (`especialidad_id`, `especialidad_nombre`, `especialidad_fregistro`, `especialidad_estatus`) VALUES
(1, 'MEDICO GENERAL', '2024-11-26', 'ACTIVO'),
(2, 'PSICOLOGÍA', '2024-11-26', 'ACTIVO'),
(3, 'INTERNISTA', '2024-11-26', 'ACTIVO'),
(4, 'PEDIATRA', '2024-11-26', 'ACTIVO'),
(6, 'FISIOTERAPIA', '2024-11-27', 'ACTIVO'),
(7, 'NEURO-CIRUJANO', '2024-11-29', 'ACTIVO'),
(8, 'MEDICO ESPECIALISTA', '2025-01-06', 'ACTIVO');

-- --------------------------------------------------------

--
-- Table structure for table `examen`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `examen` (
  `id` bigint(20) NOT NULL,
  `examen_nombre` varchar(100) DEFAULT NULL,
  `examen_fregistro` date DEFAULT NULL,
  `examen_estatus` varchar(8) DEFAULT NULL,
  `analisis_id_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `examen`
--

INSERT INTO `examen` (`id`, `examen_nombre`, `examen_fregistro`, `examen_estatus`, `analisis_id_id`) VALUES
(1, 'SANGRE', '2025-01-23', 'ACTIVO', 1),
(2, 'ORINA', '2025-01-23', 'ACTIVO', 1),
(3, 'HECES', '2025-01-23', 'ACTIVO', 1);

-- --------------------------------------------------------

--
-- Table structure for table `insumos_productos`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `insumos_productos` (
  `codigo` varchar(12) NOT NULL,
  `nombrep` varchar(20) NOT NULL,
  `cantidad` varchar(20) NOT NULL,
  `proveedor_id` varchar(10) NOT NULL,
  `descripcion` varchar(55) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `insumos_productos`
--

INSERT INTO `insumos_productos` (`codigo`, `nombrep`, `cantidad`, `proveedor_id`, `descripcion`) VALUES
('12983712', 'Algodon3', '23', '30883632', '333'),
('1298xf37', 'Algodon5', '20', '30883632', 'hfhfghfgh'),
('145612xd', 'Algodon12', '20', '30883632', 'hfhfghfgh'),
('145634cv', 'Algodon6', '23', '30883632', 'hfhfghfgh'),
('3x23712', 'Algodon4', '23', '30883632', 'hfhfghfgh'),
('7x76382', 'Algodon9', '23', '30883632', 'hfhfghfgh'),
('876382', 'Algodon', '4', '30883632', 'Sirve para limpiar o desinfectar heridas'),
('8763823', 'Algodon2', '23', '30883632', 'hfhfghfgh'),
('8xc76382', 'Algodon12', '23', '30883632', 'hfhfghfgh'),
('983712', 'Algodon10', '23', '30883632', 'hfhfghfgh'),
('h783xcw2', 'Algodon8', '23', '30883632', 'hfhfghfgh');

-- --------------------------------------------------------

--
-- Table structure for table `medico`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `medico` (
  `medico_id` int(11) NOT NULL,
  `medico_nombre` varchar(100) DEFAULT NULL,
  `medico_apepat` varchar(100) DEFAULT NULL,
  `medico_apemat` varchar(100) DEFAULT NULL,
  `medico_direccion` varchar(100) DEFAULT NULL,
  `medico_movil` varchar(100) DEFAULT NULL,
  `medico_fenac` date DEFAULT NULL,
  `medico_nrodocumento` varchar(12) DEFAULT NULL,
  `especialidad_id` int(11) DEFAULT NULL,
  `usuario_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medico`
--

INSERT INTO `medico` (`medico_id`, `medico_nombre`, `medico_apepat`, `medico_apemat`, `medico_direccion`, `medico_movil`, `medico_fenac`, `medico_nrodocumento`, `especialidad_id`, `usuario_id`) VALUES
(19, 'Reiber Jose', 'Rodriguez', 'Lopez', 'Urb. Ciudad Colonial', '+5804249876332', '2003-03-15', '30883632', 1, 3),
(20, 'Sabrina Betania', 'Rojas', 'Rondon', 'Vía La Pica', '+5804249876392', '2003-10-12', '30883637', 2, 4),
(21, 'Carlos Alberto', 'Rojas', 'Williams', 'Urb. Ciudad Colonial', '+584249876322', '2025-01-06', '30883673', 6, 8),
(22, 'Angel', 'Mena', 'Velasquez', 'Urb. Ciudad Colonial', '+584148529474', '2025-01-06', '30133637', 6, 9),
(23, 'Ronald', 'Fuentes', 'Gonzales', 'Urb. Villas La Cruz', '+584249876392', '1982-06-23', '30899321', 1, 10),
(24, 'Pancho Alberto', 'Lopez', 'Almeida', 'Urb. Ciudad Colonial', '+5804148529474', '2025-01-30', '31883633', 1, 11),
(25, 'Pollito', 'Brito', 'Lopez', 'Urb. Ciudad Colonial', '+5804148529474', '2025-02-02', '3082345', 1, 12);

-- --------------------------------------------------------

--
-- Table structure for table `paciente`
--
-- Creation: Feb 18, 2025 at 12:52 PM
--

CREATE TABLE `paciente` (
  `id` bigint(20) NOT NULL,
  `paciente_nombres` varchar(100) DEFAULT NULL,
  `paciente_apepaterno` varchar(100) DEFAULT NULL,
  `paciente_apematerno` varchar(100) DEFAULT NULL,
  `paciente_dni` varchar(35) DEFAULT NULL,
  `paciente_celular` varchar(35) DEFAULT NULL,
  `paciente_sexo` varchar(12) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paciente`
--

INSERT INTO `paciente` (`id`, `paciente_nombres`, `paciente_apepaterno`, `paciente_apematerno`, `paciente_dni`, `paciente_celular`, `paciente_sexo`, `fecha_nacimiento`, `date_joined`) VALUES
(6, 'Andrea', 'Fong', 'Navarro', '30883637', '+5804148529474', 'MASCULINO', '2025-01-15', '2025-02-18 13:33:32.611066'),
(7, 'Andrea', 'Fong', 'Navarro', '30883631', '+5804148529474', 'MASCULINO', '2025-02-01', '2025-02-18 14:07:16.046626'),
(8, 'Andres', 'Becerra', 'Lopez', '30883632', '+5804148529474', 'MASCULINO', '2025-01-30', '2025-02-18 15:04:48.474661');

-- --------------------------------------------------------

--
-- Table structure for table `proveedores_proveedores`
--
-- Creation: Jan 23, 2025 at 09:38 PM
--

CREATE TABLE `proveedores_proveedores` (
  `cedula_prov` varchar(10) NOT NULL,
  `rif` varchar(15) NOT NULL,
  `nombre_prov` varchar(20) NOT NULL,
  `apellido_prov` varchar(20) NOT NULL,
  `direccion_prov` varchar(35) NOT NULL,
  `telefono_prov` varchar(20) NOT NULL,
  `email_prov` varchar(35) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proveedores_proveedores`
--

INSERT INTO `proveedores_proveedores` (`cedula_prov`, `rif`, `nombre_prov`, `apellido_prov`, `direccion_prov`, `telefono_prov`, `email_prov`, `date_joined`) VALUES
('13098234', 'V130982340', 'Ricardo', 'Peña', 'Urb. Ciudad Colonial', '+5804128529474', 'fongesmaster67@gmail.com', '2025-02-18 14:16:08.475430'),
('30883632', 'V308836320', 'Angel Miguel', 'Fuentes', 'Urb. Ciudad Colonial', '+584148529478', 'angelfuentes989@gmail.com', '2025-01-23 22:49:23.429873');

-- --------------------------------------------------------

--
-- Table structure for table `realizar_examen`
--
-- Creation: Feb 18, 2025 at 12:49 PM
--

CREATE TABLE `realizar_examen` (
  `id` bigint(20) NOT NULL,
  `realizarexamen_estatus` varchar(10) DEFAULT NULL,
  `realizarexamen_fregistro` date DEFAULT NULL,
  `paciente_id_id` bigint(20) DEFAULT NULL,
  `medico_id_id` int(11) DEFAULT NULL,
  `usuario_id_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `realizar_examen_detalle`
--
-- Creation: Feb 18, 2025 at 12:49 PM
--

CREATE TABLE `realizar_examen_detalle` (
  `id` bigint(20) NOT NULL,
  `analisis_id` bigint(20) DEFAULT NULL,
  `examen_id` bigint(20) DEFAULT NULL,
  `realizarexamen_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resultado`
--
-- Creation: Feb 18, 2025 at 12:49 PM
--

CREATE TABLE `resultado` (
  `id` bigint(20) NOT NULL,
  `resultado_fregistro` date DEFAULT NULL,
  `resultado_estatus` varchar(1) DEFAULT NULL,
  `usuario_id_id` bigint(20) DEFAULT NULL,
  `realizarexamen_id_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `resultado`
--
DELIMITER $$
CREATE TRIGGER `actualizar_realizarexamen_estatus` AFTER INSERT ON `resultado` FOR EACH ROW BEGIN
    -- Actualizar el estatus
    UPDATE realizar_examen
    SET realizarexamen_estatus = 'FINALIZADO'
    WHERE id = NEW.realizarexamen_id_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `resultado_detalle`
--
-- Creation: Feb 18, 2025 at 12:49 PM
--

CREATE TABLE `resultado_detalle` (
  `id` bigint(20) NOT NULL,
  `resuldetalle_archivo` varchar(100) DEFAULT NULL,
  `rdetalle_id` bigint(20) DEFAULT NULL,
  `resultado_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rol`
--
-- Creation: Jan 23, 2025 at 09:38 PM
--

CREATE TABLE `rol` (
  `rol_id` int(11) NOT NULL,
  `rol_nombre` varchar(30) DEFAULT NULL,
  `rol_fregistro` date DEFAULT NULL,
  `rol_estatus` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rol`
--

INSERT INTO `rol` (`rol_id`, `rol_nombre`, `rol_fregistro`, `rol_estatus`) VALUES
(1, 'JEFE DE LABORATORIO', '2024-11-09', 'ACTIVO'),
(2, 'ASISTENTE', '2024-11-10', 'ACTIVO'),
(3, 'MEDICO', '2024-11-10', 'ACTIVO');

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `usuario` (
  `id` bigint(20) NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `picture` varchar(100) NOT NULL,
  `location` varchar(60) DEFAULT NULL,
  `bio` longtext DEFAULT NULL,
  `usu_status` varchar(8) DEFAULT NULL,
  `rol_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `picture`, `location`, `bio`, `usu_status`, `rol_id`) VALUES
(1, 'pbkdf2_sha256$720000$9uOYMhYxZHVHktbVk1Qs7U$AKteX694WTfhBDb1mFA7V0R49lIKzSNxPO4+nJ8dxg0=', '2025-01-06 09:13:55.778187', 1, 'maria13', 'Maria Estefania', 'Marcano Forero', 'maria13@gmail.com', 1, 1, '2024-11-30 13:48:11.000000', 'users/b663e45c4aee72df3f0c1020019b295b.jpg', 'Maturín', 'hola soy maria y amoo robloblobbloxxxxxxx', 'INACTIVO', 1),
(2, 'pbkdf2_sha256$720000$WmA2k8jLL7V2MjjaiR3DyX$hc9Ib5PzYERJ6d+vKvZpL76hOsKJBVqVIYcFtSkb/tg=', NULL, 0, 'fongesmaster67', '', '', 'fongesmaster67@gmail.com', 0, 1, '2024-11-30 13:51:25.517415', 'users/bd5fc873fb606232058fad06f3977e8d.jpg', '', '', 'ACTIVO', 2),
(3, 'pbkdf2_sha256$720000$J7aLTiqJRU77jdkgQy5rik$VSRuSjZTZUSlJEGgaexLR5Sfn8t01te+wGxkzyJg5Xk=', '2024-12-09 13:44:53.077798', 0, 'scythe', '', '', 'reiberjose@gmail.com', 0, 1, '2024-11-30 13:58:16.000000', 'users/15849a37cbf84a43cc5e001142f5be1b.jpg', NULL, '', 'ACTIVO', 3),
(4, 'pbkdf2_sha256$720000$Lvf6YWDOW8jGnQW40QdA2M$IiPvK44DIb69Lo3SUgSMSQPAaM9kouurtj4CglNrDI4=', '2024-12-09 12:50:15.031474', 0, '@sabrita', '', '', 'sabritaroja13s@gmail.com', 0, 1, '2024-11-30 14:00:08.421502', 'users/3b41a2e91c2dcb524862b56e38f943d1.jpg', NULL, NULL, 'INACTIVO', 2),
(5, 'pbkdf2_sha256$720000$jZvlyukp97if4WNRksnoi4$krD3WvYH36mocknP8zz8DGraQKTJ9nWeMYjyTVIbB5A=', '2025-02-08 17:02:45.098474', 0, 'sagitta_luminis', '', '', 'ricardop9899@gmail.com', 1, 1, '2024-12-04 10:04:45.000000', 'users/31d5625d265086201c80579bf0b7ef1d.jpg', NULL, '', 'ACTIVO', 1),
(7, 'pbkdf2_sha256$720000$UvprE3D8t9D0Xb2CyOEfdI$8pAvCPjVpbCtQzm+heU1rX34QZ+8WM1wf+Sz6GeDD8A=', '2024-12-04 16:52:43.241977', 0, 'lab_user', '', '', 'laboratorio@gmail.com', 0, 1, '2024-12-04 16:52:24.072928', 'users/profile_default.png', '', '', 'ACTIVO', 1),
(8, 'pbkdf2_sha256$720000$Fouqstr4dtTu2nPwTVN2YU$aQn79Pj11N6qfj90dmPZeVa7Vw2Lir9mduXHHbpiKS4=', NULL, 0, 'carlitosrojas23', '', '', 'carlosrojas@gmail.com', 0, 1, '2025-01-06 09:45:31.361036', 'users/profile_default.png', NULL, NULL, 'ACTIVO', 3),
(9, 'pbkdf2_sha256$720000$iNyYF2yEzVJpal8PzOOjzp$tmUTXK7Q57Hr+rc6ohyf8hUU7KP/bQa1xRuH0W7cMiY=', NULL, 0, 'angelx23', '', '', 'angelxmena@gmail.com', 0, 1, '2025-01-06 09:48:48.757650', 'users/profile_default.png', NULL, NULL, 'ACTIVO', 3),
(10, 'pbkdf2_sha256$720000$hZuQvWyK4jlrl9BvG5A9TA$99VgXLBhHYqbA9Mtrp4SYoYCjL+KWRrwjk2F1n/2F08=', NULL, 0, 'ronaldgonza76', '', '', 'ronaldgonza76@gmail.com', 0, 1, '2025-01-23 22:53:06.171980', 'users/profile_default.png', NULL, NULL, NULL, 3),
(11, 'pbkdf2_sha256$720000$dYfHRR1fsqtOtlN1wGy2ox$KUbUInQ4i0nczScVPRWlKzX+ZxqQIu2KrfAHHs+kHQU=', NULL, 0, 'lopez@90', '', '', 'lopezesmaster@gmail.com', 0, 1, '2025-02-08 17:07:07.835652', 'users/lopez@90.jpg', NULL, NULL, NULL, 3),
(12, 'pbkdf2_sha256$720000$YUJQpMoG3KZ8xfkqNYD132$GN7tsAR6Xiwat0NoSOTMNi6lmckoBZOB0EYC5FsYgjE=', NULL, 0, 'pollito67', '', '', 'pollito99@gmail.com', 0, 1, '2025-02-18 13:59:28.003785', 'users/profile_default.png', NULL, NULL, NULL, 3);

-- --------------------------------------------------------

--
-- Table structure for table `usuario_groups`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `usuario_groups` (
  `id` bigint(20) NOT NULL,
  `profile_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuario_user_permissions`
--
-- Creation: Jan 23, 2025 at 09:39 PM
--

CREATE TABLE `usuario_user_permissions` (
  `id` bigint(20) NOT NULL,
  `profile_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `analisis`
--
ALTER TABLE `analisis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `auth_group_name_key` (`name`);

--
-- Indexes for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissions_group_id_b120cbf9` (`group_id`),
  ADD KEY `auth_group_permissions_permission_id_84c5c92e` (`permission_id`);

--
-- Indexes for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  ADD KEY `auth_permission_content_type_id_2f476e4b` (`content_type_id`);

--
-- Indexes for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6` (`user_id`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indexes for table `especialidad`
--
ALTER TABLE `especialidad`
  ADD PRIMARY KEY (`especialidad_id`);

--
-- Indexes for table `examen`
--
ALTER TABLE `examen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `examen_analisi_36cbc0_idx` (`analisis_id_id`),
  ADD KEY `examen_analisis_id_id_2e283f54` (`analisis_id_id`);

--
-- Indexes for table `insumos_productos`
--
ALTER TABLE `insumos_productos`
  ADD PRIMARY KEY (`codigo`),
  ADD KEY `insumos_productos_proveedor_id_24361517_fk_proveedor` (`proveedor_id`),
  ADD KEY `insumos_productos_proveedor_id_24361517` (`proveedor_id`);

--
-- Indexes for table `medico`
--
ALTER TABLE `medico`
  ADD PRIMARY KEY (`medico_id`),
  ADD KEY `medico_especialidad_id_40b263a3` (`especialidad_id`),
  ADD KEY `medico_usuario_id_54959655` (`usuario_id`);

--
-- Indexes for table `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `paciente_paciente_dni_1909a4ee_uniq` (`paciente_dni`),
  ADD UNIQUE KEY `paciente_dni` (`paciente_dni`);

--
-- Indexes for table `proveedores_proveedores`
--
ALTER TABLE `proveedores_proveedores`
  ADD PRIMARY KEY (`cedula_prov`);

--
-- Indexes for table `realizar_examen`
--
ALTER TABLE `realizar_examen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `realizar_examen_paciente_id_c25f61b7` (`paciente_id_id`),
  ADD KEY `realizar_ex_pacient_a9c5d3_idx` (`paciente_id_id`),
  ADD KEY `realizar_examen_usuario_id_id_3c174361` (`usuario_id_id`),
  ADD KEY `realizar_examen_medico_id_id_15511b8e` (`medico_id_id`);

--
-- Indexes for table `realizar_examen_detalle`
--
ALTER TABLE `realizar_examen_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `realizar_ex_examen__dbb9fe_idx` (`examen_id`),
  ADD KEY `realizar_ex_analisi_4e0851_idx` (`analisis_id`),
  ADD KEY `realizar_ex_realiza_2e0571_idx` (`realizarexamen_id`),
  ADD KEY `realizar_examen_detalle_realizarexamen_id_56272b3e` (`realizarexamen_id`),
  ADD KEY `realizar_examen_detalle_analisis_id_a7168ec2` (`analisis_id`),
  ADD KEY `realizar_examen_detalle_examen_id_af4e54f2` (`examen_id`);

--
-- Indexes for table `resultado`
--
ALTER TABLE `resultado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resultado_usuario_id_id_f65ff472` (`usuario_id_id`),
  ADD KEY `resultado_realizarexamen_id_id_c44fba21` (`realizarexamen_id_id`);

--
-- Indexes for table `resultado_detalle`
--
ALTER TABLE `resultado_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resultado_d_resulta_f43d34_idx` (`resultado_id`),
  ADD KEY `resultado_d_rdetall_63249c_idx` (`rdetalle_id`),
  ADD KEY `resultado_detalle_rdetalle_id_f588185c` (`rdetalle_id`),
  ADD KEY `resultado_detalle_resultado_id_3c676c28` (`resultado_id`);

--
-- Indexes for table `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`rol_id`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `adminlite_profile_username_key` (`username`),
  ADD KEY `usuario_rol_id_ac58b608` (`rol_id`);

--
-- Indexes for table `usuario_groups`
--
ALTER TABLE `usuario_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `adminlite_profile_groups_profile_id_group_id_62e09278_uniq` (`profile_id`,`group_id`),
  ADD KEY `adminlite_profile_groups_profile_id_c76d4235` (`profile_id`),
  ADD KEY `adminlite_profile_groups_group_id_40fe7569` (`group_id`);

--
-- Indexes for table `usuario_user_permissions`
--
ALTER TABLE `usuario_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `adminlite_profile_user_p_profile_id_permission_id_d0100894_uniq` (`profile_id`,`permission_id`),
  ADD KEY `adminlite_profile_user_permissions_profile_id_3d214d7c` (`profile_id`),
  ADD KEY `adminlite_profile_user_permissions_permission_id_041e87d5` (`permission_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `analisis`
--
ALTER TABLE `analisis`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `especialidad`
--
ALTER TABLE `especialidad`
  MODIFY `especialidad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `examen`
--
ALTER TABLE `examen`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `medico`
--
ALTER TABLE `medico`
  MODIFY `medico_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `realizar_examen`
--
ALTER TABLE `realizar_examen`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `realizar_examen_detalle`
--
ALTER TABLE `realizar_examen_detalle`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resultado`
--
ALTER TABLE `resultado`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resultado_detalle`
--
ALTER TABLE `resultado_detalle`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rol`
--
ALTER TABLE `rol`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `usuario_groups`
--
ALTER TABLE `usuario_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuario_user_permissions`
--
ALTER TABLE `usuario_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Constraints for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_adminlite_profile_id` FOREIGN KEY (`user_id`) REFERENCES `usuario` (`id`);

--
-- Constraints for table `examen`
--
ALTER TABLE `examen`
  ADD CONSTRAINT `examen_analisis_id_id_2e283f54_fk_analisis_id` FOREIGN KEY (`analisis_id_id`) REFERENCES `analisis` (`id`);

--
-- Constraints for table `insumos_productos`
--
ALTER TABLE `insumos_productos`
  ADD CONSTRAINT `insumos_productos_proveedor_id_24361517_fk_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores_proveedores` (`cedula_prov`);

--
-- Constraints for table `medico`
--
ALTER TABLE `medico`
  ADD CONSTRAINT `medico_especialidad_id_40b263a3_fk_especialidad_especialidad_id` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidad` (`especialidad_id`),
  ADD CONSTRAINT `medico_usuario_id_54959655_fk_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Constraints for table `realizar_examen`
--
ALTER TABLE `realizar_examen`
  ADD CONSTRAINT `realizar_examen_medico_id_id_15511b8e_fk_medico_medico_id` FOREIGN KEY (`medico_id_id`) REFERENCES `medico` (`medico_id`),
  ADD CONSTRAINT `realizar_examen_paciente_id_id_fdf30e5c_fk_paciente_id` FOREIGN KEY (`paciente_id_id`) REFERENCES `paciente` (`id`),
  ADD CONSTRAINT `realizar_examen_usuario_id_id_3c174361_fk_usuario_id` FOREIGN KEY (`usuario_id_id`) REFERENCES `usuario` (`id`);

--
-- Constraints for table `realizar_examen_detalle`
--
ALTER TABLE `realizar_examen_detalle`
  ADD CONSTRAINT `realizar_examen_deta_realizarexamen_id_56272b3e_fk_realizar_` FOREIGN KEY (`realizarexamen_id`) REFERENCES `realizar_examen` (`id`),
  ADD CONSTRAINT `realizar_examen_detalle_analisis_id_a7168ec2_fk_analisis_id` FOREIGN KEY (`analisis_id`) REFERENCES `analisis` (`id`),
  ADD CONSTRAINT `realizar_examen_detalle_examen_id_af4e54f2_fk_examen_id` FOREIGN KEY (`examen_id`) REFERENCES `examen` (`id`);

--
-- Constraints for table `resultado`
--
ALTER TABLE `resultado`
  ADD CONSTRAINT `resultado_realizarexamen_id_id_c44fba21_fk_realizar_examen_id` FOREIGN KEY (`realizarexamen_id_id`) REFERENCES `realizar_examen` (`id`),
  ADD CONSTRAINT `resultado_usuario_id_id_f65ff472_fk_usuario_id` FOREIGN KEY (`usuario_id_id`) REFERENCES `usuario` (`id`);

--
-- Constraints for table `resultado_detalle`
--
ALTER TABLE `resultado_detalle`
  ADD CONSTRAINT `resultado_detalle_rdetalle_id_f588185c_fk_realizar_` FOREIGN KEY (`rdetalle_id`) REFERENCES `realizar_examen_detalle` (`id`),
  ADD CONSTRAINT `resultado_detalle_resultado_id_3c676c28_fk_resultado_id` FOREIGN KEY (`resultado_id`) REFERENCES `resultado` (`id`);

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_rol_id_ac58b608_fk_rol_rol_id` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`rol_id`);

--
-- Constraints for table `usuario_groups`
--
ALTER TABLE `usuario_groups`
  ADD CONSTRAINT `adminlite_profile_gr_profile_id_c76d4235_fk_adminlite` FOREIGN KEY (`profile_id`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `adminlite_profile_groups_group_id_40fe7569_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `usuario_user_permissions`
--
ALTER TABLE `usuario_user_permissions`
  ADD CONSTRAINT `adminlite_profile_us_permission_id_041e87d5_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `adminlite_profile_us_profile_id_3d214d7c_fk_adminlite` FOREIGN KEY (`profile_id`) REFERENCES `usuario` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
