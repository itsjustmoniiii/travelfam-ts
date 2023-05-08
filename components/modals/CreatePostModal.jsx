import useCreatePostModal from '@/hooks/useCreatePostModal';
import { useCallback, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import Modal from '../Modal';
import axios from 'axios';
import usePosts from '@/hooks/usePosts';
import useTrendingPosts from '@/hooks/useTrendingPosts';
import ImageUpload from '../ImageUpload';
import { toast } from 'react-hot-toast';
import { BsTrash } from 'react-icons/bs';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useRouter } from 'next/router';

const CreatePostModal = () => {
  const router = useRouter();
  const { mutate: mutatePosts = [] } = usePosts();
  const createPostModal = useCreatePostModal();
  const [file, setFile] = useState();
  const [text, setText] = useState('');
  const [imageSrc, setImageSrc] = useState();
  const [uploadData, setUploadData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const { userId } = router.query;
  const { mutate: mutateFetchedUserPosts } = usePosts(userId);
  const {
    data: fetchedTrendingPosts = [],
    mutate: mutateFetchedTrendingPosts,
  } = useTrendingPosts();

  const handleOnChange = (event) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(event.target.files[0]);
  };

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      const fileImage = document.querySelector('#fileupload');
      let formData = new FormData();

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

        await axios.post('/api/posts', {
          text,
          image: data.public_id,
          height: data.height,
          width: data.width,
        });
      } else {
        await axios.post('/api/posts', {
          text,
        });
      }

      toast.success('Successfully created');
      setText('');
      mutatePosts();

      mutateFetchedTrendingPosts();
      mutateFetchedUserPosts();
      createPostModal.onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      setText('');
    }
    setIsLoading(false);
  }, [
    text,
    mutatePosts,
    createPostModal,
    mutateFetchedTrendingPosts,
    mutateFetchedUserPosts,
  ]);

  const bodyOfModal = (
    <div className="flex flex-col gap-4 modal">
      <textarea
        placeholder="Enter text..."
        value={text}
        disabled={isLoading}
        onChange={(e) => setText(e.target.value)}
        className="p-2 rounded h-20"
      />
      <div>
        <label
          htmlFor="fileupload"
          className="p-5 flex items-center justify-center text-white font-bold w-full border border-white rounded-md"
        >
          Choose a File
        </label>

        <input
          type="file"
          placeholder="Upload a picture"
          name="file"
          id="fileupload"
          accept="image/*"
          disabled={isLoading}
          className="hidden"
          onChange={handleOnChange}
        />
        {imageSrc && imageSrc !== '' && (
          <>
            <div className="w-full flex items-center justify-center bg-neutral-900 py-3 rounded-lg mt-4">
              <CldImage
                width="200"
                height="200"
                crop="fill"
                src={imageSrc}
                alt="post-img"
              />
            </div>

            <div
              onClick={() => {
                setImageSrc('');
                document.getElementById('fileupload').value = '';
              }}
              className="flex items-center gap-1 text-red-600 cursor-pointer hover:underline"
            >
              <BsTrash color="red" />
              <p>Remove Image</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Modal
        body={bodyOfModal}
        disabled={isLoading}
        isOpen={createPostModal.isOpen}
        title="Create a post"
        submitBtnLabel="Publish"
        onClose={createPostModal.onClose}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default CreatePostModal;
