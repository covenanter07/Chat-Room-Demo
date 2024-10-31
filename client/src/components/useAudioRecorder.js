import { useState, useRef } from "react";

const useAudioRecorder = (uploadFile, setMessage) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // start recording
  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);

          mediaRecorderRef.current.ondataavailable = (event) => {
            const blob = new Blob([event.data], { type: "audio/wav" });
            setAudioBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);

          // start timer
          timerRef.current = setInterval(() => {
            setRecordingTime((prevTime) => prevTime + 1);
          }, 1000);
        })
        .catch((error) => {
          console.error("Error accessing microphone: ", error);
        });
    }
  };

  // stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current); // clear timer
      setIsRecording(false);
    }
  };

  // change recording status
  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Remove recording
  const removeRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
  };

  // Upload audio
  const handleSendAudio = async () => {
    if (audioBlob) {
      setLoading(true);
      const file = new File([audioBlob], "audio.wav", { type: "audio/wav" });
      try {
        const uploadResult = await uploadFile(file);
        setMessage((prev) => ({
          ...prev,
          audioUrl: uploadResult.url,
        }));
      } catch (error) {
        console.error("Error uploading audio: ", error);
      } finally {
        setLoading(false);
        removeRecording(); // clear recording
      }
    }
  };

  return {
    isRecording,
    recordingTime,
    audioUrl,
    handleRecording,
    removeRecording,
    handleSendAudio,
    loading,
  };
};

export default useAudioRecorder;
