import { User } from "../models/user.model.js";
import { Token } from "../models/token.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("email : ", email);
    console.log(req.body);

    if ([username, email, password].some((field) => field?.trim() === "")) {
      // throw new ApiError(400, "all fields are required");
      res.send("all fields are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      return res.status(400).json(new ApiResponse(400, [], "email exist"));
    }

    const createdUser = await User.create({
      username,
      email,
      password,
    });

    const userData = await User.findById(createdUser._id).select("-password");

    if (!userData) {
      return res
        .status(500)
        .send({ message: "Something wrong registering the User" });
    }

    return res
      .status(201)
      .json(new ApiResponse(200, userData, "User created successfully!!"));
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    // throw new ApiError(404, "User does not exists");
    return res
      .status(404)
      .json(new ApiResponse(404, [], "User does not exists"));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    // throw new ApiError(400, "Invalid user credentials");
    return res
      .status(404)
      .json(new ApiResponse(404, [], "Invalid user credentials"));
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user_id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged Out successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");

  if (!users || users.length === 0) {
    throw new ApiError(404, "Users not found");
  }

  return res.status(200).json(new ApiResponse(200, users, "all users fetched"));
});

const singleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id not exists");
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched successfully"));
});

const userUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id not exists");
  }

  const user = await User.findById(id).select("-password");

  const { username, email } = req.body;
  // console.log(name, email);

  if (username) {
    user.username = username;
  }
  if (email) {
    user.email = email;
  }

  const updatedUser = await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Updated User successfully"));
});

const getToken = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  console.log(user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const token = await Token.findOne({
    userId: user._id,
    token: req.params.token,
  });

  console.log(token);
  if (!token) {
    throw new ApiError(400, "Invalid link");
  }

  await User.updateOne({ _id: user._id }, { isVerified: true });
  await token.deleteOne();

  return res.status(200).send({ message: "email verified" });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  singleUser,
  userUpdate,
  getToken,
};
