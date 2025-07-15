import { Router } from "express"
import { getCars, createCar } from "../controllers/carController"

const router = Router()

router.get("/", getCars)
router.post("/", createCar)

export default router
