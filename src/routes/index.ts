import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController";
import { createBoard, listBoards, getBoardById } from "../controllers/boardController";
import { createColumn, listColumnsByBoard } from "../controllers/columnController"; 
import { createCard, moveCard } from "../controllers/cardController";

const router = Router();

// Users
router.post("/users", createUser);
router.get("/users", listUsers);

// Boards
router.post("/boards", createBoard);
router.get("/boards", listBoards);
router.get("/boards/:id", getBoardById);
router.get("/boards/:boardId/columns", listColumnsByBoard);

// Columns
router.post("/columns", createColumn);

// Cards
router.post("/cards", createCard);
router.patch("/cards/:id/move", moveCard);

export default router;