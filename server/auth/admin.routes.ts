import { Router, Request, Response, NextFunction } from "express";
import { log } from '../src/logging/logging';
import { successResponse, errorResponse } from '../src/utils/response.utils';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { requireAuth } from '../middlewares/requireAuth';
import { listUsersQuerySchema, updateStatusSchema, updateRoleSchema } from '../src/schemas';
import { listUsers, countUsers, updateUserStatus, updateUserRole, findUserById } from '../src/repositories/user.repo';
import { Role, UserStatus } from '../src/generated/prisma';

const router = Router();

router.use(requireAuth(["ADMIN"]));

router.get(
  "/users",
  validateQuery(listUsersQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, role, limit, offset } = (req as any).validatedQuery;
      const requestId = req.requestId;

      const users = await listUsers({
        status: status as UserStatus,
        role: role as Role,
        limit,
        offset,
      });

      const total = await countUsers({
        status: status as UserStatus,
        role: role as Role,
      });

      log("audit", "admin_list_users", {
        requestId,
        user: req.user?.sub,
        filters: { status, role },
        count: users.length,
      });

      successResponse(res, {
        users,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + users.length < total,
        },
      }, requestId);
    } catch (err) {
      log("error", "admin_list_users_error", {
        requestId: req.requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      next(err);
    }
  }
);

router.patch(
  "/users/:id/status",
  validateBody(updateStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;
      const requestId = req.requestId;

      const user = await findUserById(id);
      if (!user) {
        errorResponse(res, "User not found", requestId, 404, "USER_NOT_FOUND");
        return;
      }

      if (user.id === req.user?.id) {
        errorResponse(res, "Cannot modify your own status", requestId, 400, "INVALID_OPERATION");
        return;
      }

      const updated = await updateUserStatus(id, status as UserStatus);

      log("audit", "admin_update_user_status", {
        requestId,
        admin: req.user?.sub,
        targetUser: user.username,
        oldStatus: user.status,
        newStatus: status,
      });

      successResponse(res, updated, requestId);
    } catch (err) {
      log("error", "admin_update_status_error", {
        requestId: req.requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      next(err);
    }
  }
);

router.patch(
  "/users/:id/role",
  validateBody(updateRoleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { role } = req.body;
      const requestId = req.requestId;

      const user = await findUserById(id);
      if (!user) {
        errorResponse(res, "User not found", requestId, 404, "USER_NOT_FOUND");
        return;
      }

      if (user.id === req.user?.id) {
        errorResponse(res, "Cannot modify your own role", requestId, 400, "INVALID_OPERATION");
        return;
      }

      const updated = await updateUserRole(id, role as Role);

      log("audit", "admin_update_user_role", {
        requestId,
        admin: req.user?.sub,
        targetUser: user.username,
        oldRole: user.role,
        newRole: role,
      });

      successResponse(res, updated, requestId);
    } catch (err) {
      log("error", "admin_update_role_error", {
        requestId: req.requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      next(err);
    }
  }
);

router.get(
  "/organizations",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = req.requestId;

      const users = await listUsers({
        status: UserStatus.ACTIVE,
        limit: 100,
        offset: 0,
      });

      const organizations = users
        .filter(u => u.role !== Role.ADMIN)
        .map(u => ({
          id: u.id,
          name: u.username.charAt(0).toUpperCase() + u.username.slice(1).replace(/[-_]/g, ' '),
          username: u.username,
        }));

      successResponse(res, { organizations }, requestId);
    } catch (err) {
      log("error", "admin_list_organizations_error", {
        requestId: req.requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      next(err);
    }
  }
);

export default router;
