import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { sectToken } from '../redux/userSlice';

const CheckPasswordPage = () => {
    const [data, setData] = useState({ password: "" });
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!location?.state?.name) {
            navigate('/email');
        }
    }, [location, navigate]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


        const handleSubmit = async (e) => {
          e.preventDefault();
          e.stopPropagation();
      
          const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;
      
          try {
              const response = await axios.post(URL, {
                  userId: location?.state?._id,
                  password: data.password
              }, { withCredentials: true });
      
              toast.success(response.data.message);

              if (response.data.success) {
                  dispatch(sectToken(response?.data?.token))
                  localStorage.setItem('token',response?.data?.token)


                  setData({ password: "" });
                  navigate('/');
              }
          } catch (error) {
              toast.error(error?.response?.data?.message || "An error occurred. Please try again.");
          }
      };

    return (
        <div className='mt-5'>
            <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto'>
                <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
                    <Avatar
                        width={50}
                        height={50}
                        name={location?.state?.name}
                        imageUrl={location?.state?.profile?.pic}
                    />
                    <h2 className='font-semibold text-lg mt-0'>{location?.state?.name}</h2>
                </div>

                <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='password'>Password:</label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Enter your password'
                            className='bg-slate-100 px-2 py-1 focus:outline-primary'
                            value={data.password}
                            onChange={handleOnChange}
                            required
                        />
                    </div>

                    <button
                        className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-black leading-relaxed tracking-wide'
                    >
                        Login
                    </button>
                </form>
            </div>
            <Toaster />
        </div>
    );
}

export default CheckPasswordPage;