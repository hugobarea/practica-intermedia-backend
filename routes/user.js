const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/session.js');
const { validatorPostRegister, validatorPutValidation, validatorPostValidation, validatorPostRecover, validatorPatchPassword, validatorLogin } = require('../validators/auth.js');
const { validatorPutRegister, validatorPatchCompany, validatorPostInvite } = require('../validators/onboarding.js');
const { uploadMiddlewareMemory } = require("../utils/handleStorage.js");
const { getUser, registerUser, validateUser, loginUser, updateUser, deleteUser, addUserLogo, addCompany, setRecoverCode, validatePassReset, changePassword, inviteGuest } = require('../controllers/user.js');

/**
 * @openapi
 * components:
 *  schemas:
 *    userLoginRegister:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *        password:
 *          type: string
 *          minLength: 8
 *      required:
 *        - email
 *        - password
 *    userUpdate:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        surnames:
 *          type: string
 *        nif:
 *          type: string
 *    companyUpdate:
 *      type: object
 *      properties:
 *        company:
 *          type: string
 *    resetPassword:
 *      type: object
 *      properties:
 *        password:
 *          type: string
 *          minLength: 8
 *    guestInvitation:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        surnames:
 *          type: string
 *        email:
 *          type: string
 *          format: email
 *        company:
 *          type: string
 *      required:
 *        - name
 *        - email
 *        - company
 */

/* Endpoints de gestión de usuario */
/**
 * @openapi
 * /api/user:
 *  get:
 *    tags:
 *    - User
 *    summary: Obtener información del usuario
 *    description: Obtiene los datos del usuario autenticado usando el JWT
 *    responses:
 *      200:
 *        description: Datos del usuario (sin contraseña)
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/user"
 *      401:
 *        description: Token inválido o no proporcionado
 *      500:
 *        description: Error del servidor
 *    security:
 *      - bearerAuth: []
 */
router.get("/", authMiddleware, getUser);

/**
 * @openapi
 * /api/user:
 *  delete:
 *    tags:
 *    - User
 *    summary: Eliminar usuario
 *    description: Elimina el usuario actual (soft/hard delete)
 *    parameters:
 *      - in: query
 *        name: soft
 *        schema:
 *          type: boolean
 *          default: true
 *        description: Tipo de borrado (true=soft, false=hard)
 *    responses:
 *      200:
 *        description: Usuario eliminado (SOFT_DEL/HARD_DEL)
 *      401:
 *        description: No autorizado
 *      500:
 *        description: Error del servidor
 *    security:
 *      - bearerAuth: []
 */
router.delete("/", authMiddleware, deleteUser);

/* Endpoints de login/registro/validacion */
/**
 * @openapi
 * /api/user/login:
 *  post:
 *    tags:
 *    - User
 *    summary: Iniciar sesión
 *    description: Autentica un usuario y devuelve un JWT
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/userLoginRegister"
 *    responses:
 *      200:
 *        description: Autenticación exitosa
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                user:
 *                  $ref: "#/components/schemas/user"
 *      401:
 *        description: Credenciales inválidas o usuario no validado
 *      404:
 *        description: Usuario no encontrado
 *      500:
 *        description: Error del servidor
 */
router.post("/login", validatorLogin, loginUser);

/**
 * @openapi
 * /api/user/register:
 *  post:
 *    tags:
 *    - User
 *    summary: Registrar nuevo usuario
 *    description: Crea una nueva cuenta de usuario
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/userLoginRegister"
 *    responses:
 *      201:
 *        description: Usuario registrado
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                user:
 *                  $ref: "#/components/schemas/user"
 *      409:
 *        description: Usuario ya registrado
 *      500:
 *        description: Error del servidor
 */
router.post("/register", validatorPostRegister, registerUser);

/**
 * @openapi
 * /api/user/register:
 *  put:
 *    tags:
 *    - User
 *    summary: Actualizar datos de usuario
 *    description: Actualiza la información del usuario autenticado
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/userUpdate"
 *    responses:
 *      200:
 *        description: Datos actualizados
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/user"
 *      401:
 *        description: No autorizado
 *      500:
 *        description: Error del servidor
 *    security:
 *      - bearerAuth: []
 */
router.put("/register", authMiddleware, validatorPutRegister, updateUser);

/**
 * @openapi
 * /api/user/validation:
 *  put:
 *    tags:
 *    - User
 *    summary: Validar código de verificación
 *    description: Valida el código de verificación enviado por correo
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              code:
 *                type: string
 *                length: 6
 *            required:
 *              - code
 *    responses:
 *      200:
 *        description: Código validado correctamente
 *      400:
 *        description: Código inválido
 *      401:
 *        description: No autorizado
 *      500:
 *        description: Error del servidor
 *    security:
 *      - bearerAuth: []
 */
router.put("/validation", authMiddleware, validatorPutValidation, validateUser);

/* Endpoints de recuperación de contraseña */
/**
 * @openapi
 * /api/user/recover:
 *  post:
 *    tags:
 *    - User
 *    summary: Solicitar recuperación de contraseña
 *    description: Envía un código de recuperación al email del usuario
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *            required:
 *              - email
 *    responses:
 *      200:
 *        description: Código enviado al correo
 *      404:
 *        description: Usuario no encontrado
 *      500:
 *        description: Error del servidor
 */
router.post("/recover", validatorPostRecover, setRecoverCode);

/**
 * @openapi
 * /api/user/validation:
 *  post:
 *    tags:
 *    - User
 *    summary: Validar código de recuperación
 *    description: Valida el código de recuperación para cambiar contraseña
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *              code:
 *                type: string
 *                length: 6
 *            required:
 *              - email
 *              - code
 *    responses:
 *      200:
 *        description: Código válido, token generado
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *      400:
 *        description: Código inválido
 *      404:
 *        description: Usuario no encontrado
 *      500:
 *        description: Error del servidor
 */
router.post("/validation", validatorPostValidation, validatePassReset);

/**
 * @openapi
 * /api/user/password:
 *  patch:
 *    tags:
 *    - User
 *    summary: Cambiar contraseña
 *    description: Cambia la contraseña del usuario autenticado
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/resetPassword"
 *    responses:
 *      200:
 *        description: Contraseña actualizada
 *      401:
 *        description: No autorizado
 *      500:
 *        description: Error del servidor
 *    security:
 *      - bearerAuth: []
 */
router.patch("/password", authMiddleware, validatorPatchPassword, changePassword);

/* Endpoints de funcionalidades adicionales */
/**
 * @openapi
 * /api/user/logo:
 *  patch:
 *    tags:
 *    - User
 *    summary: Subir logo de usuario
 *    description: Sube una imagen como logo del usuario (formato multipart)
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              logo:
 *                type: string
 *                format: binary
 *    responses:
 *      200:
 *        description: Logo actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/user"
 *      400:
 *        description: No se envió archivo
 *      401:
 *        description: No autorizado
 *      500:
 *        description: Error del servidor
 *    security:
 *      - bearerAuth: []
 */
router.patch("/logo", authMiddleware, uploadMiddlewareMemory.single("logo"), addUserLogo);

/**
 * @openapi
 * /api/user/company:
 *  patch:
 *    tags:
 *    - User
 *    summary: Actualizar empresa
 *    description: Actualiza la información de empresa del usuario
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/companyUpdate"
 *    responses:
 *      200:
 *        description: Empresa actualizada
 *      401:
 *        description: No autorizado
 *      500:
 *        description: Error del servidor
 *    security:
 *      - bearerAuth: []
 */
router.patch("/company", authMiddleware, validatorPatchCompany, addCompany);

/**
 * @openapi
 * /api/user/invite:
 *  post:
 *    tags:
 *    - User
 *    summary: Invitar usuario
 *    description: Crea una cuenta temporal de invitado asociada a una empresa
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/guestInvitation"
 *    responses:
 *      200:
 *        description: Invitación creada
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                user:
 *                  $ref: "#/components/schemas/user"
 *      409:
 *        description: Usuario ya existe
 *      500:
 *        description: Error del servidor
 */
router.post("/invite", validatorPostInvite, inviteGuest);

module.exports = router;