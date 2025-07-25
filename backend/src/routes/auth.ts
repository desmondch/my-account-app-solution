import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById } from "../database";
import { authenticateToken, generateToken, AuthRequest } from "../middleware/auth";
import { VerifyCodeSchema } from "../module/model";
import { validate } from "../middleware/validation";
import { getAuthCode, setAuthCode, setAuthenticatedAdditionalInfo } from "../module/authCodes";

const router = express.Router();

interface LoginRequest {
  email: string;
  password: string;
}

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.password) {
      // eslint-disable-next-line no-console
      console.error("User password is missing for user:", user.email);
      return res.status(500).json({ error: "Internal server error" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...safeUser } = user;

    res.json({
      user: safeUser,
      token,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/request-code", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserById(req.userId!);

    if (user) {
      setAuthCode(user.id)
    }

    res.sendStatus(201)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Could be stored in an env instead
const AUTH_CODE_MAX_TIME_DIFF = 300_000;


router.post("/verify-code", authenticateToken, validate(null, null, VerifyCodeSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (typeof req.userId !== 'number') {
      throw new Error('Unable to get user id')
    }

    const { code } = VerifyCodeSchema.parse(req.body)

    let authCodeEntry = getAuthCode(req.userId);

    let currTime = new Date().getTime();
    if (authCodeEntry && authCodeEntry.code === code && currTime - authCodeEntry.generatedAt.getTime() <= AUTH_CODE_MAX_TIME_DIFF) {
      const user = await getUserById(req.userId);
      const token = generateToken(req.userId);
      setAuthenticatedAdditionalInfo(req.userId);

      res.json({
        user: user,
        token,
      });
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Auth code verify error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
