import { Request, Response } from "express"
import Car from "../models/Car"

export const getCars = async (req: Request, res: Response) => {
  const cars = await Car.find()
  res.json(cars)
}

export const createCar = async (req: Request, res: Response) => {
  try {
    const car = await Car.create(req.body)
    res.status(201).json(car)
  } catch (err) {
    res.status(400).json({ error: "Erro ao cadastrar carro" })
  }
}
