import { prismaClient } from "@repo/db";
import { Request,Response } from "express";

const signUp = (req : Request, res : Response) => {
    try {
        const { email, password } = req.body;
        
    } catch (error) {
        console.error(error);
    }
}

const signIn = (req : Request, res : Response) => {
    try {
        const { email, password } = req.body;
    } catch (error) {
        console.log(error);
    }
}

export { signUp, signIn }