import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { TfiAngleLeft } from "react-icons/tfi";
import { FaPlus, FaImages, FaFilePdf } from "react-icons/fa";
import { IoVideocamSharp, IoSend } from "react-icons/io5";
import uploadFile from "../helpers/uploadFile";
import { IoMdClose } from "react-icons/io";
import Loading from "./Loading";
import backgroundImage from "../assets/wallpaper.jpg";
import moment from "moment";
import { BsEmojiSmileFill } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { FaMicrophone } from "react-icons/fa";
import useAudioRecorder from "./useAudioRecorder";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaArrowAltCircleUp } from "react-icons/fa";
import { IoStopCircle } from "react-icons/io5";
import { IoMdCloseCircle } from "react-icons/io";
import { FaTrash } from "react-icons/fa6";

const urlRegex = /(https?:\/\/[^\s]+)/g;

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const user = useSelector((state) => state?.user);
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
    pdfUrl: "",
    audioUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessages] = useState([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRecordingOptions, setShowRecordingOptions] = useState(false);

  // using useAudioRecorder Hook
  const {
    isRecording,
    recordingTime,
    audioUrl,
    handleRecording,
    removeRecording,
    handleSendAudio,
  } = useAudioRecorder(uploadFile, setMessage);
  const currentMessage = useRef(null);

  const getFileNameFromUrl = (url) => {
    return url.substring(url.lastIndexOf("/") + 1);
  };

  // handle emoji click
  const handleEmojiClick = (emoji) => {
    setMessage((prev) => ({
      ...prev,
      text: prev.text + emoji.emoji,
    }));
    setShowEmojiPicker(false);
  };

  const handleEmojiModal = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage]);

  // Upload image
  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload((prev) => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadResult = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage((prev) => ({
      ...prev,
      imageUrl: uploadResult.url,
    }));
  };

  const handleClearUploadImage = () => {
    setMessage((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  // Upload video
  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadResult = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage((prev) => ({
      ...prev,
      videoUrl: uploadResult.url,
    }));
  };

  const handleClearUploadVideo = () => {
    setMessage((prev) => ({
      ...prev,
      videoUrl: "",
    }));
  };

  // Upload PDF File
  const handleUploadPDF = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setLoading(true);
      const uploadResult = await uploadFile(file);
      setLoading(false);
      setOpenImageVideoUpload(false);
      setMessage((prev) => ({
        ...prev,
        pdfUrl: uploadResult.url,
      }));
      setIsPdfModalOpen(true); // Open PDF modal
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleClearUploadPDF = () => {
    setMessage((prev) => ({
      ...prev,
      pdfUrl: "",
    }));
    setIsPdfModalOpen(false);
    setPdfFile(null);
  };

  // Toggle recording options
  const toggleRecordingOptions = () => {
    setShowRecordingOptions(!showRecordingOptions);
  };

  // Delete Conversation
  const handleDeleteConversation = () => {
    if (socketConnection) {
      socketConnection.emit("delete-conversation", {
        senderId: user._id,
        receiverId: params.userId,
      });
    }
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params.userId);
      socketConnection.emit("seen", params.userId);

      const handleUserMessage = (data) => setDataUser(data);
      const handleMessages = (data) => setAllMessages(data);

      socketConnection.on("message-user", handleUserMessage);
      socketConnection.on("message", handleMessages);

      // Cleanup on unmount
      return () => {
        socketConnection.off("message-user", handleUserMessage);
        socketConnection.off("message", handleMessages);
      };
    }
  }, [socketConnection, params?.userId, user]);

  useEffect(() => {
    if (socketConnection) {
      const handleDeleteResponse = (data) => {
        if (data.success) {
          alert("Conversation deleted successfully!");
          setAllMessages([]);
        } else {
          alert("Failed to delete conversation.");
        }
      };

      socketConnection.on("conversation-deleted", handleDeleteResponse);

      return () => {
        socketConnection.off("conversation-deleted", handleDeleteResponse);
      };
    }
  }, [socketConnection]);

  const handleOnChange = (e) => {
    const { value } = e.target;
    setMessage((prev) => ({
      ...prev,
      text: value,
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (
      message.text ||
      message.imageUrl ||
      message.videoUrl ||
      message.pdfUrl ||
      message.audioUrl
    ) {
      if (socketConnection) {
        socketConnection.emit("new message", {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          pdfUrl: message.pdfUrl,
          audioUrl: message.audioUrl,
          msgByuserId: user?._id,
        });
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: "",
          pdfUrl: "",
          audioUrl: "",
        });
        setIsPdfModalOpen(false);
      }
    }
  };

  // Function to parse URLs in the message text and replace them with clickable links
  const renderMessageWithLinks = (text) => {
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            key={index}
            className="text-blue-600 underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className="bg-no-repeat bg-cover"
    >
      <header className="sticky top-0 h-16 bg-white flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="lg:hidden">
            <TfiAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
              {dataUser?.name}
            </h3>
            <p className="-my-2 text-sm">
              {dataUser.online ? (
                <span className="text-primary">online</span>
              ) : (
                <span className="text-gray-400">offline</span>
              )}
            </p>
          </div>
        </div>
        <div>
          <button
            className="w-fit p-2 relative top-0 right-0 cursor-pointer hover:text-primary"
            onClick={handleDeleteConversation}
          >
            <FaTrash size={20} />
          </button>
          <button className="cursor-pointer hover:text-primary">
            <HiDotsVertical />
          </button>
        </div>
      </header>

      {/*** show all message */}
      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50">
        <div className="flex flex-col py-2 mx-2" ref={currentMessage}>
          {allMessage.map((msg, index) => {
            return (
              <div
                key={index}
                className={`p-1 py-1 my-2 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${
                  user._id === msg.msgByuserId
                    ? "ml-auto bg-teal-100"
                    : "bg-white"
                }`}
              >
                <div className="w-full">
                  {msg?.imageUrl && (
                    <img
                      src={msg?.imageUrl}
                      className="w-full h-full object-scale-down"
                      alt="Message content"
                    />
                  )}
                  {msg?.videoUrl && (
                    <video
                      src={msg?.videoUrl}
                      className="w-full h-full object-scale-down"
                      controls
                    />
                  )}
                  {msg?.pdfUrl && (
                    <div className="flex items-center">
                      <FaFilePdf size={24} className="text-red-600" />
                      <a
                        href={msg.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline"
                      >
                        {getFileNameFromUrl(msg.pdfUrl)}
                      </a>
                    </div>
                  )}
                  {msg.audioUrl && (
                    <audio controls src={msg.audioUrl} className="mt-2" />
                  )}
                </div>
                <p className="px-2">{renderMessageWithLinks(msg.text)}</p>
                <p className="text-xs ml-auto w-fit">
                  {moment(msg.createdAt).format("hh:mm")}
                </p>
              </div>
            );
          })}
        </div>

        {/*** upload Image display */}
        {message.imageUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div
              className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-primary"
              onClick={handleClearUploadImage}
            >
              <IoMdClose size={30} />
            </div>
            <div className="bg-white p-3">
              <img
                src={message.imageUrl}
                alt="uploadImage"
                className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
              />
            </div>
          </div>
        )}

        {/*** upload Video display */}
        {message.videoUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div
              className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-primary"
              onClick={handleClearUploadVideo}
            >
              <IoMdClose size={30} />
            </div>
            <div className="bg-white p-3">
              <video
                src={message.videoUrl}
                className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
                controls
                muted
                autoPlay
              />
            </div>
          </div>
        )}

        {/** upload PDF File display */}
        {isPdfModalOpen && message.pdfUrl && (
          <div className="w-full h-full sticky bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="relative w-full max-w-3xl p-4 bg-white rounded-lg shadow-lg">
              <button
                onClick={handleClearUploadPDF}
                className="absolute top-2 right-2 text-xl hover:text-primary"
              >
                <IoMdClose size={30} />
              </button>
              <iframe
                src={message.pdfUrl}
                className="w-full h-[600px] rounded"
                title="PDF Preview"
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading />
          </div>
        )}
      </section>

      {/*** send message */}
      <section className="h-16 bg-white flex items-center px-4">
        <div className="relative">
          <button
            onClick={handleUploadImageVideoOpen}
            className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white"
          >
            <FaPlus size={20} />
          </button>
          {openImageVideoUpload && (
            <div className="bg-white shadow rounded absolute bottom-14 w-36 p-2">
              <form>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-primary">
                    <FaImages size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <label
                  htmlFor="uploadVideo"
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-pink-500">
                    <IoVideocamSharp size={18} />
                  </div>
                  <p>Video</p>
                </label>
                <label
                  htmlFor="uploadPDF"
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <FaFilePdf size={18} className="text-red-600" />
                  <p>PDF</p>
                </label>
                <input
                  type="file"
                  id="uploadImage"
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <input
                  type="file"
                  id="uploadVideo"
                  onChange={handleUploadVideo}
                  className="hidden"
                />
                <input
                  type="file"
                  id="uploadPDF"
                  onChange={handleUploadPDF}
                  className="hidden"
                />
              </form>
            </div>
          )}
        </div>

        <form className="h-full w-full flex gap-2" onSubmit={handleSendMessage}>
          <div className="relative flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={toggleRecordingOptions}
              className="flex justify-center items-center rounded-full hover:bg-primary hover:text-white gap-4"
            >
              {showRecordingOptions ? (
                <IoMdCloseCircle size={20} />
              ) : (
                <FaMicrophone size={20} />
              )}
            </button>

            {showRecordingOptions && (
              <div className="fixed bottom-0 left-0 right-0 bg-white p-4 flex flex-col items-center">
                {audioUrl && !isRecording && (
                  <>
                    <button
                      onClick={removeRecording}
                      className="bg-red-500 text-white px-4 py-2 rounded mb-2 flex items-center"
                    >
                      <FaRegTrashCan size={20} />
                    </button>
                    <audio controls className="min-w-[800px] mb-2">
                      <source src={audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <button
                      onClick={() => handleSendAudio(audioUrl)}
                      className="bg-green-500 text-white px-4 py-2 rounded mb-2 flex-row items-center"
                    >
                      <FaArrowAltCircleUp size={20} />
                    </button>
                  </>
                )}

                {isRecording && (
                  <>
                    <p className="text-sm font-medium mb-2">
                      Recording: {recordingTime}s
                    </p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-2 flex-row items-center">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${recordingTime * 0.5}%`,
                        }}
                      ></div>
                    </div>
                    <button
                      onClick={handleRecording}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      <IoStopCircle size={20} />
                    </button>
                  </>
                )}
                {!isRecording && !audioUrl && (
                  <button
                    onClick={handleRecording}
                    className="bg-green-500 text-white px-4 py-2 rounded-full"
                  >
                    <FaMicrophone size={20} />
                  </button>
                )}
                <button
                  onClick={toggleRecordingOptions}
                  className="absolute top-0 right-0 p-2"
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            )}
          </div>

          {/**input box */}
          <input
            type="text"
            placeholder="Type a message..."
            className="py-1 px-4 outline-none w-full h-full"
            value={message.text}
            onChange={handleOnChange}
          />
          <button
            type="button"
            className="text-gray-400 hover:text-gray-400"
            onClick={handleEmojiModal}
          >
            <BsEmojiSmileFill size={20} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-16 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <button type="submit" className="text-primary hover:text-secondary">
            <IoSend size={20} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
