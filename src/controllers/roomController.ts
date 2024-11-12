import { Request, Response, NextFunction } from "express";
import * as roomService from "../services/roomService.js";
import { IRequest } from "index.js";

export const create = async (req: any, res: any, next: NextFunction) => {
  try {
    const newRoom = await roomService.create(
      req.session.user,
      req.body.maxPlayers,
      req.body.numberOfTurns
    );
    res.json(newRoom);
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomDto = await roomService.getById(req.params.id);
    res.json(roomDto);
  } catch (error) {
    next(error);
  }
};

export const getByIdDetailed = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomDto = await roomService.getByIdDetailed(req.params.id);
    res.json(roomDto);
  } catch (error) {
    next(error);
  }
};

export const deleteAll = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    roomService.deleteAll();
    res.json("Ok");
  } catch (error) {
    next(error);
  }
};

export const getMyQuest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const questDto = await roomService.getMyQuest(
      req.session.user.id,
      req.params.id
    );
    res.json(questDto);
  } catch (error) {
    next(error);
  }
};

export const join = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.session.user;
    await roomService.join({ ...user, isReady: false }, req.params.id, req.io);
    res.json();
  } catch (error) {
    next(error);
  }
};

export const start = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await roomService.start(req.session.user.id, req.params.id, req.io);
    res.json();
  } catch (error) {
    next(error);
  }
};

export const postSentence = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await roomService.postSentence(
      req.session.user.id,
      req.params.id,
      req.body.sentence,
      req.io
    );
    res.json();
  } catch (error) {
    next(error);
  }
};

export const postDrawing = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await roomService.postDrawing(
      req.session.user.id,
      req.params.id,
      req.body.drawing,
      req.io
    );
    res.json();
  } catch (error) {
    next(error);
  }
};
