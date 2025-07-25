import express, { Request, Response } from "express";
import {
  getUserById,
  updateUser,
  getAllUsers,
  UserUpdateData,
  SafeUser,
  SafeUserFullInfo,
} from "../database";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { checkIsAuthenticatedAdditionalInfo } from "../module/authCodes";
import { validate } from "../middleware/validation";

interface ErrorResponse {
  error: string
}


const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching users:", error);
    res.status(500).json({ error });
  }
});


router.get("/me", authenticateToken, async (req: AuthRequest, res: Response<SafeUser | SafeUserFullInfo | ErrorResponse>) => {
  try {
    const userInfoFull = await getUserById(req.userId!);

    if (!userInfoFull) {
      return res.status(404).json({ error: "User not found" });
    }

    if (checkIsAuthenticatedAdditionalInfo(req.userId!)) {
      res.json(userInfoFull);
    } else {
      const userInfo: SafeUser = {
        id: userInfoFull.id,
        name: userInfoFull.name,
        date_of_birth: userInfoFull.date_of_birth,
        post_address: userInfoFull.post_address,
        home_address: userInfoFull.home_address,
        facebook_url: userInfoFull.facebook_url,
        twitter_url: userInfoFull.twitter_url,
        youtube_url: userInfoFull.youtube_url,
        created_at: userInfoFull.created_at,
        updated_at: userInfoFull.updated_at
      };
      res.json(userInfo);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Note: could be updated with the middleware validate(null, null, UpdateUserSchema) to validate / sanitize input
router.put("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const updateData: UserUpdateData = {};

    const allowedFields = [
      "name",
      "email",
      "date_of_birth",
      "phone_number",
      "post_address",
      "home_address",
      "bank_name",
      "bsb",
      "account_name",
      "account_number",
      "facebook_url",
      "twitter_url",
      "youtube_url",
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field as keyof UserUpdateData] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    let updatedUser = null;

    if (checkIsAuthenticatedAdditionalInfo(req.userId!)) {
      updatedUser = await updateUser(req.userId!, updateData);
    } else {
      // Also not ideal, just ensures that sensitive fields can't be modified
      let updatedDataSubset = {
        name: updateData.name,
        date_of_birth: updateData.date_of_birth,
        post_address: updateData.post_address,
        home_address: updateData.home_address,
        facebook_url: updateData.facebook_url,
        twitter_url: updateData.twitter_url,
        youtube_url: updateData.youtube_url
      }
      updatedUser = await updateUser(req.userId!, updatedDataSubset);
      if (updatedUser) {
        updatedUser = {
          name: updatedUser.name,
          date_of_birth: updatedUser.date_of_birth,
          post_address: updatedUser.post_address,
          home_address: updatedUser.home_address,
          facebook_url: updatedUser.facebook_url,
          twitter_url: updatedUser.twitter_url,
          youtube_url: updatedUser.youtube_url
        }
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating user:", error);
    res.status(500).json({ error: `Internal server error ${error}` });
  }
});

export default router;
