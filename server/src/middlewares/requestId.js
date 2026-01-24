import { v4 as uuidv4} from "uuid";

export function requestIdMiddleware(req, res, next){
    req.requestId = uuidv4();
    res.setHeader("x-sftp-request-id", req.requestId);
    next();
}

    