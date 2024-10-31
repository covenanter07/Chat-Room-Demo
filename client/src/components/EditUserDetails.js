import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import uploadFile from '../helpers/uploadFile';
import Divider from './Divider';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

const EditUserDetails = ({ onClose, user }) => {
    const [data, setData] = useState({
        name: user?.name,
        profile_pic: user?.profile_pic,
    });
    const [isLoading, setIsLoading] = useState(false);
    const uploadPhotoRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            ...user,
        }));
    }, [user]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOpenUploadPhoto = (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadPhotoRef.current.click();
    };

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const uploadPhoto = await uploadFile(file);
                if (uploadPhoto?.url) {
                    setData((prev) => ({
                        ...prev,
                        profile_pic: uploadPhoto.url,
                    }));
                } else {
                    toast.error('Failed to get upload URL');
                }
            } catch (error) {
                toast.error('Failed to upload photo');
                console.error('Error uploading photo:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
    
        const userData = {
            name: data.name,
            profile_pic: data.profile_pic,
        };
    
        try {
            console.log('Submitting data:', userData); // Log the data being submitted
            const URL = `${process.env.REACT_APP_BACKEND_URL}/api/update-user`;
            const response = await axios.post(URL, userData, { withCredentials: true });
    
            if (response.data.success) {
                toast.success(response.data.message);
                dispatch(setUser(response.data.data));
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to update user details');
            }
        } catch (error) {
            toast.error('An error occurred while updating user details');
            console.error('Error updating user details:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10'>
            <div className='bg-white p-4 py-6 m-1 rounded w-full max-w-sm'>
                <h2 className='font-semibold'>Profile Details</h2>
                <p className='text-sm'>Edit user details</p>

                <form className='grid gap-3 mt-3' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='name'>Name:</label>
                        <input
                            type='text'
                            name='name'
                            id='name'
                            value={data.name}
                            onChange={handleOnChange}
                            className='w-full py-1 px-2 focus:outline-primary border-0.5'
                        />
                    </div>

                    <div>
                        <label htmlFor='profile_pic'>Photo</label>
                        <div className='my-1 flex items-center gap-4'>
                            <Avatar
                                width={40}
                                height={40}
                                imageUrl={data?.profile_pic}
                                name={data?.name}
                            />
                            <button
                                type='button'
                                className='text-semibold cursor-pointer'
                                onClick={handleOpenUploadPhoto}
                            >
                                Change Photo
                            </button>
                            <input
                                type='file'
                                ref={uploadPhotoRef}
                                className='hidden'
                                onChange={handleUploadPhoto}
                            />
                        </div>
                    </div>

                    <Divider />

                    <div className='flex gap-2 w-fit ml-auto'>
                        <button type='button' onClick={onClose} className='py-1 px-4 bg-gray-200 rounded'>
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='py-1 px-4 bg-blue-500 text-white rounded'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditUserDetails.propTypes = {
    onClose: PropTypes.func.isRequired,
    user: PropTypes.shape({
        name: PropTypes.string,
        profile_pic: PropTypes.string,
    }).isRequired,
};

export default React.memo(EditUserDetails);

