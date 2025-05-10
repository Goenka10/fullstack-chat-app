import express from "express"
import { login, logout, signUp } from "../contollers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateProfile } from "../contollers/auth.controllers.js";
import { checkAuth } from "../contollers/auth.controllers.js";


const router = express.Router();

router.post("/signup", signUp );

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute , updateProfile );

router.get("/check" , protectRoute , checkAuth);

export default router;