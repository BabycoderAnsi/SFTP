import { log } from "../logging/logging.js";

export function auditMiddleware(action){
    return (req, res, next) => {
        res.on('finish', ()=>{
            log('audit', 'file_action',{
                'requestId': req.requestId,
                'user': req.user?.sub,
                'role': req.user?.role,
                action,
                'path': req.query.path || req.body?.path,
                'status': res.statusCode,
            })
        })
        next();
    }
}
