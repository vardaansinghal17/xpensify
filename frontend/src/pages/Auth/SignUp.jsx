import React, { useContext } from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../components/layouts/AuthLayout'
import Input from '../../components/Inputs/Input'
import { validateEmail } from '../../utils/helper'
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector'
import axios from 'axios'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/UserContext'
import axiosInstance from '../../utils/axiosInstance'
import uploadImage from '../../utils/uploadImage'

const SignUp = () => {

  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const handleSignUp = async (e) => {
    e.preventDefault();
    let profileImageUrl = "";

    if (!fullName) {
      setError("Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please Enter the password.");
      return;
    }
    setError("");

    //api call

    try {
      if(profilePic){
        const imgUploadRes = await uploadImage(profilePic);
         profileImageUrl = imgUploadRes.imageURL || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName,
        email,
        password,
        profileImageUrl,

      });
      const { user, token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }

    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong.Please try again..")
      }
    }

  }

  return (
    <AuthLayout>
      <div className=' lg:w-[100%] h—auto md:h—full mt-25 md:mt—0  '>
        <h3 className='text—xl font-semibold text-black '>Create an Account</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb—6 ' >Join us today by entering your details below</p>
      </div>
      <form className='mt-5' onSubmit={handleSignUp}>
        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />



        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            value={fullName}
            onChange={({ target }) => setFullName(target.value)}
            type="text"
            label="Full Name"
            placeholder="Vardaan Singhal"
          />
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            type="text"
            label="Email Address"
            placeholder="john@example.com"
          />
          <div className='col-span-2'>
            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              type="password"
              label="Password"
              placeholder="Min 8 characters"
            /></div>
        </div>
        {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

        <button type='submit' className='btn-primary'>SIGN UP</button>
        <p className='text-[13px] text-slate-800 mt-3'>
          Already have an account? {""}
          <Link className='text-blue-700 underline' to='/login'>
            Login</Link>
        </p>

      </form>
    </AuthLayout>
  )
}

export default SignUp
