import { useCallback, useEffect, useState } from 'react';
import Input from '../Input';
import Modal from '../Modal';
import useEditProfileModal from '@/hooks/useEditProfileModal';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { CldImage } from 'next-cloudinary';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const EditProfileModal = () => {
  const { data: currentUser } = useCurrentUser();
  const { mutate: mutateFetchedUser } = useUser(currentUser?.id);
  const editProfileModal = useEditProfileModal();

  //states
  const [profileImage, setProfileImage] = useState();
  const [uploadData, setUploadData] = useState();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [imageSrc, setImageSrc] = useState();
  const [isPrivate, setIsPrivate] = useState(false);

  const handleChange = (event) => {
    setIsPrivate(!isPrivate);
  };

  const labelStyle = {
    color: '#FFFFFF', // Replace with the desired text color
  };

  //initialize all of the existing fields
  useEffect(() => {
    setProfileImage(currentUser?.profileImage || '');
    setUsername(currentUser?.username);
    setBio(currentUser?.bio || '');
    setIsPrivate(currentUser?.isPrivate);
  }, [currentUser]);

  //loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChange = (event) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target.result);
    };
    reader.readAsDataURL(event.target.files[0]);
  };
  //on submit function
  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      const fileImage = document.querySelector('#fileimageupload');
      const formData = new FormData();

      if (fileImage.files[0] !== undefined) {
        formData.append('file', fileImage.files[0]);
        formData.append('upload_preset', 'travelfam-uploads');
        const data = await fetch(
          'https://api.cloudinary.com/v1_1/travelfam/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        )
          .then((r) => r.json())
          .then((r) => {
            setUploadData(r.public_id);
            return r;
          });

        await axios.patch('/api/edit', {
          username,
          bio,
          uploadData: data.public_id,
          isPrivate,
        });
      } else {
        await axios.patch('/api/edit', {
          username,
          bio,
          uploadData: '',
          isPrivate,
        });
      }

      mutateFetchedUser();
      toast.success('Successfully updated');
      editProfileModal.onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
    setIsLoading(false);
  }, [editProfileModal, bio, username, isPrivate, mutateFetchedUser]);

  const bodyOfModal = (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-full">
        <div>
          {profileImage && profileImage !== '' && (
            <>
              <div className="w-full flex items-center justify-center bg-neutral-900 py-3 rounded-lg mt-4">
                <CldImage
                  width="200"
                  height="200"
                  crop="fill"
                  src={profileImage}
                  alt="post-img"
                />
              </div>
            </>
          )}
          <label
            htmlFor="fileimageupload"
            className="p-5 flex items-center justify-center text-white font-bold w-full border border-white rounded-md"
          >
            Choose a new profile image
          </label>

          <input
            type="file"
            placeholder="Upload a profile image"
            name="file"
            id="fileimageupload"
            accept="image/*"
            disabled={isLoading}
            className="hidden"
            onChange={handleOnChange}
          />
        </div>
      </div>

      <div className="w-full">
        <p className="text-white font-bold">Username Settings</p>

        <Input
          placeholder="Username"
          value={username}
          disabled={isLoading}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="w-full">
        <p className="text-white font-bold">Bio Settings</p>
        <Input
          placeholder="Bio"
          value={bio}
          disabled={isLoading}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      <div className="flex w-full flex-col">
        <p className="text-white font-bold">Privacy Settings</p>
        <FormControlLabel
          control={
            <Switch
              checked={isPrivate ? false : true}
              onChange={handleChange}
            />
          }
          label={isPrivate ? 'Private' : 'Public'}
          labelPlacement="end"
          style={labelStyle}
        />
      </div>
    </div>
  );

  return (
    <>
      <Modal
        body={bodyOfModal}
        disabled={isLoading}
        isOpen={editProfileModal.isOpen}
        title="Edit your profile"
        submitBtnLabel="Save changes"
        onClose={editProfileModal.onClose}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default EditProfileModal;
