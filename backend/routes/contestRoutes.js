import { autoCreateContest } from "../controllers/contestController.js";


router.post("/auto-create", authMiddleware, autoCreateContest);
