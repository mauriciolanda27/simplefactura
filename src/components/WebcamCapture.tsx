import { useState, useRef, useCallback, useEffect } from 'react';
import { Button, Box, Typography, Paper, Stack, IconButton, CircularProgress, Alert } from '@mui/material';
import { CameraAlt, FlipCameraAndroid, Delete, Check, Close } from '@mui/icons-material';

interface WebcamCaptureProps {
  onImageCapture: (file: File) => void;
  onClose: () => void;
}

export default function WebcamCapture({ onImageCapture, onClose }: WebcamCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasStartedRef = useRef(false);

  // Start webcam stream
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      
      // Wait for video to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve(true);
            };
          }
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('No se pudo acceder a la cámara. Verifique los permisos.');
      setIsLoading(false);
      setCameraActive(false);
    }
  }, [stream]);

  // Stop webcam stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }, [stream]);

  // Start camera on component mount (only once)
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []); // Empty dependency array to run only once

  // Capture image from webcam
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply flip transformation if needed
        if (isFlipped) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0);
        
        // Restore context if flipped
        if (isFlipped) {
          ctx.restore();
        }
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        // Turn off camera after capturing
        stopCamera();
      }
    }
  }, [isFlipped, stream, stopCamera]);

  // Convert base64 to File and send to parent
  const useCapturedImage = useCallback(() => {
    if (capturedImage) {
      // Convert base64 to blob
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
          onImageCapture(file);
        })
        .catch(err => {
          console.error('Error converting image:', err);
          setError('Error al procesar la imagen');
        });
    }
  }, [capturedImage, onImageCapture]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    // Turn camera back on for retake
    startCamera();
  }, [startCamera]);

  // Toggle camera flip
  const toggleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button onClick={startCamera} variant="contained">
          Reintentar
        </Button>
        <Button onClick={handleClose} sx={{ ml: 1 }}>
          Cancelar
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Capturar Factura
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Disclaimer Alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> Para que el OCR funcione correctamente, asegúrese de que:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, mb: 0 }}>
          <li>La imagen esté bien iluminada y enfocada</li>
          <li>El texto de la factura sea legible y nítido</li>
          <li>La factura esté completamente visible en el encuadre</li>
          <li>Evite sombras o reflejos que puedan afectar la lectura</li>
        </Typography>
      </Alert>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Camera Column */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              height: '400px',
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isLoading && (
                <Box sx={{ position: 'absolute', zIndex: 1 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1, color: 'white' }}>
                    Iniciando cámara...
                  </Typography>
                </Box>
              )}
              
              {!cameraActive && !capturedImage && !isLoading && (
                <Box sx={{ position: 'absolute', zIndex: 1, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                    Cámara apagada
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={startCamera}
                    startIcon={<CameraAlt />}
                  >
                    Activar Cámara
                  </Button>
                </Box>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  transform: isFlipped ? 'scaleX(-1)' : 'none',
                  objectFit: 'cover',
                  display: cameraActive && !isLoading ? 'block' : 'none'
                }}
              />
            </Box>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {cameraActive && (
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                <IconButton 
                  onClick={toggleFlip} 
                  color="primary"
                  title="Invertir imagen"
                  disabled={isLoading}
                >
                  <FlipCameraAndroid />
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={captureImage}
                  size="large"
                  disabled={isLoading || !stream}
                >
                  Capturar
                </Button>
              </Stack>
            )}
            
            {cameraActive && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {isFlipped ? 'Imagen invertida para mejor lectura' : 'Imagen normal'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Preview Column */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Vista Previa
            </Typography>
            
            {capturedImage ? (
              <>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <img
                    src={capturedImage}
                    alt="Captura previa"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      maxHeight: '350px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
                
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={retakePhoto}
                  >
                    Volver a tomar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Check />}
                    onClick={useCapturedImage}
                    color="primary"
                  >
                    Usar imagen
                  </Button>
                </Stack>
              </>
            ) : (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                minHeight: '350px'
              }}>
                <Typography variant="body1" color="text.secondary">
                  {cameraActive ? 'Captura una imagen para ver la vista previa' : 'Active la cámara para comenzar'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
} 