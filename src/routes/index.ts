import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController";
import { createBoard, listBoards } from "../controllers/boardController";

const router = Router();

// Users
router.post("/users", createUser);
router.get("/users", listUsers);

// Boards
router.post("/boards", createBoard);
router.get("/boards", listBoards);

export default router;