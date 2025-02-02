import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import generateToken from "../utils/auth";

import * as UserService from "./users.service";

export const userRouter = express.Router();

//GET A LIST OF ALL USERS 
userRouter.get("/", async (req: Request, res: Response) => {
    try {
        const users = await UserService.listUsers()
        return res.status(200).json(users);
    } catch (error: any) {
        return res.status(500).json(error.message);
    }
})

//Get a single user by id 
userRouter.get("/:id", async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10);
    try {
        const user = await UserService.getUser(id)
        if (user) {
            return res.status(200).json(user)
        }
        return res.status(400).json("User could not be found!")
    } catch (error: any) {
        return res.status(500).json(error.message);
    }
});

//create a new user 
userRouter.post("/signup",
    body("fullName").isString(), body("userName").isString(),
    body("email").isString(), body("password").isString(), async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = req.body;
            const newUser = await UserService.createUser(user);
            res.status(201).json({
                success: true,
                user: newUser,
                redirect: '/verify',
                message: 'signup successful, please login'
            });
        } catch (error: any) {
            return res.status(500).json(error.message);
        }
    });


//Updating a users information
userRouter.put("/:id", body("userName").isString(), body("email").isString(),
    body("password").isString(), async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id: number = parseInt(req.params.id, 10)
        try {
            const user = req.body
            const updatedUser = await UserService.updateUser(user, id)
            return res.status(200).json(updatedUser)
        } catch (error: any) {
            return res.status(500).json(error.message);
        }
    });

//deleting  a user based on the id 
userRouter.delete("/:id", async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10);
    try {
        await UserService.deleteUser(id)
        return res.status(204).json("User has been deleted successfully!!")
    } catch (error: any) {
        return res.status(500).json(error.message);
    }
})


userRouter.delete("/", async (req: Request, res: Response) => {
    try {
        await UserService.deleteAllUsers()
        return res.status(204).json("Users deleted successfully");
    } catch (error: any) {
        console.log("error:", error)
        return res.status(500).json({ message: "Error deleting transaction numbers" });
    }
})

//POST: to log a user in
userRouter.post("/login", async (req: Request, res: Response) => {

    try {
        const { email, password } = req.body;
        const token = await UserService.logUser(email, password);
        if (token === "") {
            return res.status(400).json({
                status: "Bad Request!",
                message: "Wrong email or Password"
            })
        }
        //const res_token = { type: "Bearer", token: token }
        res.cookie('jwt', token,
            { httpOnly: true }
        );



        return res.status(200).json({
            status: "OK!",
            message: "Successfully login",
            result: token,
        });


    } catch (error: any) {
        console.log(error)
        return res.status(500).json(error.message)
    }
})