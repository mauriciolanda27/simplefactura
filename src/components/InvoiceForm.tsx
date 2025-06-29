// components/InvoiceForm.tsx
import { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Stack, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Box,
  Typography,
  FormHelperText,
  Chip,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import UploadIcon from '@mui/icons-material/Upload';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAlert } from './AlertSystem';
import { LazyLoadingFallback } from './LazyComponents';
import { Suspense, lazy } from 'react';

// Lazy loading del componente WebcamCapture
const LazyWebcamCapture = lazy(() => import('./WebcamCapture'));

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Rubro {
  id: string;
  name: string;
  description?: string;
  type: string;
}

interface InvoiceData {
  id?: string;
  authorization_code?: string;
  name?: string;
  nit?: string;
  nit_ci_cex?: string;
  number_receipt?: string;
  purchase_date?: string;
  total_amount?: string;
  vendor?: string;
  rubroId?: string;
  categoryId?: string;
  category?: Category;
}

interface InvoiceFormProps {
  initialData?: InvoiceData;
  onSaved?: (data: InvoiceData) => void;
}

function InvoiceForm({ initialData = {}, onSaved }: InvoiceFormProps) {
  const { showSuccess, showError, showInfo } = useAlert();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    authorization_code: initialData.authorization_code || "",
    name: initialData.name || "",
    nit: initialData.nit || "",
    nit_ci_cex: initialData.nit_ci_cex || "",
    number_receipt: initialData.number_receipt || "",
    purchase_date: initialData.purchase_date || "",
    total_amount: initialData.total_amount || "",
    vendor: initialData.vendor || "",
    rubroId: initialData.rubroId || "",
    categoryId: initialData.categoryId || ""
  });

  // Estados de error
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  
  // Estados para el diálogo de nueva categoría
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Estados para el diálogo de nuevo rubro
  const [showNewRubroDialog, setShowNewRubroDialog] = useState(false);
  const [newRubroName, setNewRubroName] = useState("");
  const [newRubroDescription, setNewRubroDescription] = useState("");
  const [newRubroType, setNewRubroType] = useState("personal");
  const [creatingRubro, setCreatingRubro] = useState(false);

  // Estados para OCR progress
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Cargar categorías y rubros del usuario
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, rubrosRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/rubros')
        ]);
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
        if (rubrosRes.ok) {
          const rubrosData = await rubrosRes.json();
          setRubros(rubrosData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Error al cargar los datos');
      }
    };
    loadData();
  }, [showError]);

  // Handle webcam image capture
  const handleWebcamCapture = (capturedFile: File) => {
    setFile(capturedFile);
    setShowWebcam(false);
    showInfo('Imagen capturada correctamente');
  };

  useEffect(() => {
    if (file) {
      // Cuando se selecciona un archivo, iniciar OCR
      (async () => {
        setIsOcrProcessing(true);
        setOcrProgress(0);
        showInfo('Extrayendo datos de la factura...');
        
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setOcrProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const base64 = await toBase64(file);
        try {
          const res = await fetch('/api/invoices/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileContent: base64, fileName: file.name })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Error en OCR");
          
          // Llenar campos con datos OCR si esos campos están vacíos
          setFormData(prev => ({
            ...prev,
            authorization_code: prev.authorization_code || data.authorization_code || "",
            name: prev.name || data.name || "",
            nit: prev.nit || data.nit || "",
            nit_ci_cex: prev.nit_ci_cex || data.nit_ci_cex || "",
            number_receipt: prev.number_receipt || data.number_receipt || "",
            purchase_date: prev.purchase_date || (data.purchase_date ? formatDateForInput(data.purchase_date) : ""),
            total_amount: prev.total_amount || data.total_amount || "",
            vendor: prev.vendor || data.vendor || ""
          }));
          
          setOcrProgress(100);
          showSuccess('Datos extraídos del documento. Por favor, verifique antes de guardar.');
        } catch (e) {
          console.error(e);
          showError('No se pudo extraer automáticamente. Complete manualmente los datos.');
        } finally {
          clearInterval(progressInterval);
          setIsOcrProcessing(false);
          setOcrProgress(0);
        }
      })();
    }
  }, [file, showInfo, showSuccess, showError]);

  // Validación simple
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones obligatorias - verificar que tengan valores reales
    if (!formData.number_receipt || !formData.number_receipt.trim()) {
      newErrors.number_receipt = 'El número de recibo es obligatorio';
    }
    if (!formData.purchase_date || !formData.purchase_date.trim()) {
      newErrors.purchase_date = 'La fecha de compra es obligatoria';
    }
    if (!formData.total_amount || !formData.total_amount.trim()) {
      newErrors.total_amount = 'El monto total es obligatorio';
    }
    if (!formData.vendor || !formData.vendor.trim()) {
      newErrors.vendor = 'El vendedor es obligatorio';
    }
    if (!formData.rubroId || !formData.rubroId.trim()) {
      newErrors.rubroId = 'El rubro es obligatorio';
    }
    if (!formData.categoryId || !formData.categoryId.trim()) {
      newErrors.categoryId = 'La categoría es obligatoria';
    }
    
    // Validaciones adicionales para asegurar valores válidos
    if (formData.total_amount && formData.total_amount.trim() && isNaN(Number(formData.total_amount))) {
      newErrors.total_amount = 'El monto debe ser un número válido';
    }
    
    // Validaciones opcionales - solo verificar que no estén vacíos si se proporcionan
    if (formData.nit && !formData.nit.trim()) {
      newErrors.nit = 'NIT no puede estar vacío';
    }
    if (formData.nit_ci_cex && !formData.nit_ci_cex.trim()) {
      newErrors.nit_ci_cex = 'NIT/CI/CEX no puede estar vacío';
    }
    if (formData.authorization_code && !formData.authorization_code.trim()) {
      newErrors.authorization_code = 'El código de autorización no puede estar vacío';
    }
    if (formData.name && formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    const allFields = ['number_receipt', 'purchase_date', 'total_amount', 'vendor', 'rubroId', 'categoryId'];
    const newTouched = { ...touched };
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    // Validate form and check if there are errors
    const isValid = validateForm();
    if (!isValid) {
      showError('Por favor, complete todos los campos obligatorios');
      return;
    }

    // Prepare data for submission - ensure all required fields have values
    const submissionData = {
      ...formData,
      number_receipt: formData.number_receipt ? formData.number_receipt.trim() : '',
      purchase_date: formData.purchase_date ? formData.purchase_date.trim() : '',
      total_amount: formData.total_amount ? formData.total_amount.trim() : '',
      vendor: formData.vendor ? formData.vendor.trim() : '',
      rubroId: formData.rubroId ? formData.rubroId.trim() : '',
      categoryId: formData.categoryId ? formData.categoryId.trim() : '',
      // Optional fields
      nit: formData.nit ? formData.nit.trim() : undefined,
      nit_ci_cex: formData.nit_ci_cex ? formData.nit_ci_cex.trim() : undefined,
      authorization_code: formData.authorization_code ? formData.authorization_code.trim() : undefined,
      name: formData.name ? formData.name.trim() : undefined
    };

    // Final check - ensure all required fields have values
    const requiredFields = ['number_receipt', 'purchase_date', 'total_amount', 'vendor', 'rubroId', 'categoryId'];
    const missingFields = requiredFields.filter(field => {
      const value = submissionData[field as keyof typeof submissionData];
      return !value || value === '';
    });
    
    if (missingFields.length > 0) {
      showError('Por favor, complete todos los campos obligatorios');
      return;
    }

    try {
      const url = initialData.id ? `/api/invoices/${initialData.id}` : '/api/invoices';
      const method = initialData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar la factura');
      }

      const savedData = await response.json();
      showSuccess(initialData.id ? 'Factura actualizada correctamente' : 'Factura guardada correctamente');
      
      if (onSaved) {
        onSaved(savedData);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      showError('Error al guardar la factura');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      showError('Tipo de archivo no soportado. Use JPG, PNG o PDF.');
      return;
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      showError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setFile(selectedFile);
    showInfo('Archivo seleccionado correctamente');
  };

  const handleRemoveFile = () => {
    setFile(null);
    showInfo('Archivo removido');
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showError('El nombre de la categoría es obligatorio');
      return;
    }

    setCreatingCategory(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la categoría');
      }

      const newCategory = await response.json();
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
      
      setNewCategoryName("");
      setNewCategoryDescription("");
      setShowNewCategoryDialog(false);
      showSuccess('Categoría creada correctamente');
    } catch (error) {
      console.error('Error creating category:', error);
      showError(error instanceof Error ? error.message : 'Error al crear la categoría');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateRubro = async () => {
    if (!newRubroName.trim()) {
      showError('El nombre del rubro es obligatorio');
      return;
    }

    setCreatingRubro(true);
    try {
      const response = await fetch('/api/rubros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRubroName.trim(),
          description: newRubroDescription.trim() || undefined,
          type: newRubroType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el rubro');
      }

      const newRubro = await response.json();
      setRubros(prev => [...prev, newRubro]);
      setFormData(prev => ({ ...prev, rubroId: newRubro.id }));
      
      setNewRubroName("");
      setNewRubroDescription("");
      setShowNewRubroDialog(false);
      showSuccess('Rubro creado correctamente');
    } catch (error) {
      console.error('Error creating rubro:', error);
      showError(error instanceof Error ? error.message : 'Error al crear el rubro');
    } finally {
      setCreatingRubro(false);
    }
  };

  const ValidationStatus = ({ field }: { field: string }) => {
    const hasError = touched[field] && errors[field];
    const fieldValue = formData[field as keyof typeof formData];
    const hasValue = fieldValue && typeof fieldValue === 'string' && fieldValue.trim();
    const isRequired = ['number_receipt', 'purchase_date', 'total_amount', 'vendor', 'rubroId', 'categoryId'].includes(field);
    
    if (!touched[field]) return null;
    
    return (
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        {hasError ? (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="error">
              {errors[field]}
            </Typography>
          </>
        ) : hasValue ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="success.main">
              Campo válido
            </Typography>
          </>
        ) : isRequired ? (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="error">
              Campo obligatorio
            </Typography>
          </>
        ) : null}
      </Box>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {/* Sección de Documento */}
        <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" />
              Documento de Factura
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ 
              border: '2px dashed', 
              borderColor: 'grey.300', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              backgroundColor: 'grey.50',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50'
              }
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            >
              {file ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    {file.type.includes('image') ? (
                      <ImageIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                    ) : (
                      <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                    )}
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label="Archivo listo para procesar" 
                    color="success" 
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={handleRemoveFile}
                      startIcon={<DeleteIcon />}
                      size="small"
                    >
                      Cambiar Archivo
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <UploadIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Subir Documento
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Arrastra y suelta tu factura aquí, o haz clic para seleccionar
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<UploadIcon />}
                      size="large"
                    >
                      Seleccionar Archivo
                      <input
                        type="file"
                        hidden
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CameraAltIcon />}
                      onClick={() => setShowWebcam(true)}
                      size="large"
                    >
                      Usar Cámara
                    </Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Formatos soportados: JPG, PNG, PDF (máximo 10MB)
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* OCR Progress */}
        {isOcrProcessing && (
          <Alert severity="info" sx={{ 
            p: 2, 
            bgcolor: 'primary.50', 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'primary.200' 
          }}>
            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
              Procesando Documento con IA
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={ocrProgress} 
              sx={{ mb: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              Extrayendo datos de la factura... {ocrProgress}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Esto puede tomar unos segundos dependiendo del tamaño del archivo
            </Typography>
          </Alert>
        )}

        {/* Información básica */}
        <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" />
              Información Básica
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Fecha de Compra *"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, purchase_date: true }))}
                  error={touched.purchase_date && !!errors.purchase_date}
                  helperText={touched.purchase_date ? errors.purchase_date : ''}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <ValidationStatus field="purchase_date" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Proveedor *"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, vendor: true }))}
                  error={touched.vendor && !!errors.vendor}
                  helperText={touched.vendor ? errors.vendor : ''}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <ValidationStatus field="vendor" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Monto y categorización */}
        <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" />
              Monto y Categorización
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Monto Total *"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, total_amount: true }))}
                  error={touched.total_amount && !!errors.total_amount}
                  helperText={touched.total_amount ? errors.total_amount : ''}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <ValidationStatus field="total_amount" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth error={touched.rubroId && !!errors.rubroId}>
                  <InputLabel id="rubro-label">Rubro *</InputLabel>
                  <Select
                    labelId="rubro-label"
                    value={formData.rubroId}
                    label="Rubro *"
                    onChange={e => setFormData({ ...formData, rubroId: e.target.value })}
                    required
                  >
                    {rubros.map(rubro => (
                      <MenuItem key={rubro.id} value={rubro.id}>
                        {rubro.name} {rubro.type === 'personal' ? '(Personal)' : '(Empresa)'}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.rubroId && <FormHelperText>{errors.rubroId}</FormHelperText>}
                </FormControl>
                <Tooltip title="Agregar nuevo rubro">
                  <IconButton 
                    onClick={() => setShowNewRubroDialog(true)} 
                    size="small" 
                    sx={{ mt: 1, color: 'primary.main' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <ValidationStatus field="rubroId" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth error={touched.categoryId && !!errors.categoryId}>
                  <InputLabel>Categoría *</InputLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, categoryId: true }))}
                    label="Categoría *"
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="">Seleccionar categoría</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.categoryId && errors.categoryId && (
                    <FormHelperText error>
                      {errors.categoryId}
                    </FormHelperText>
                  )}
                </FormControl>
                <Tooltip title="Agregar nueva categoría">
                  <IconButton 
                    onClick={() => setShowNewCategoryDialog(true)} 
                    size="small" 
                    sx={{ mt: 1, color: 'primary.main' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <ValidationStatus field="categoryId" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Información fiscal */}
        <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" />
              Información Fiscal
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="NIT"
                  value={formData.nit}
                  onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, nit: true }))}
                  error={touched.nit && !!errors.nit}
                  helperText={touched.nit ? errors.nit : ''}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <ValidationStatus field="nit" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="NIT/CI/CEX"
                  value={formData.nit_ci_cex}
                  onChange={(e) => setFormData(prev => ({ ...prev, nit_ci_cex: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, nit_ci_cex: true }))}
                  error={touched.nit_ci_cex && !!errors.nit_ci_cex}
                  helperText={touched.nit_ci_cex ? errors.nit_ci_cex : ''}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <ValidationStatus field="nit_ci_cex" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Código de Autorización"
                  value={formData.authorization_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorization_code: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, authorization_code: true }))}
                  error={touched.authorization_code && !!errors.authorization_code}
                  helperText={touched.authorization_code ? errors.authorization_code : ''}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <ValidationStatus field="authorization_code" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" />
              Información Adicional
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Nombre/Razón Social"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                  error={touched.name && !!errors.name}
                  helperText={touched.name ? errors.name : ''}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <ValidationStatus field="name" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Número de Recibo"
                  value={formData.number_receipt}
                  onChange={(e) => setFormData(prev => ({ ...prev, number_receipt: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, number_receipt: true }))}
                  error={touched.number_receipt && !!errors.number_receipt}
                  helperText={touched.number_receipt ? errors.number_receipt : ''}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <ValidationStatus field="number_receipt" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            size="large"
            sx={{ 
              borderRadius: 2, 
              px: 4, 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {initialData.id ? 'Actualizar Factura' : 'Guardar Factura'}
          </Button>
        </Box>
      </Stack>

      {/* Dialog para nueva categoría */}
      <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            Nueva Categoría
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Nombre de la categoría *" 
              value={newCategoryName} 
              onChange={e => setNewCategoryName(e.target.value)} 
              required 
              fullWidth 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} 
            />
            <TextField 
              label="Descripción (opcional)" 
              value={newCategoryDescription} 
              onChange={e => setNewCategoryDescription(e.target.value)} 
              fullWidth 
              multiline 
              rows={3} 
              placeholder="Describe el propósito de esta categoría..." 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} 
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowNewCategoryDialog(false)}
            startIcon={<CancelIcon />}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateCategory} 
            variant="contained" 
            disabled={creatingCategory || !newCategoryName.trim()}
            startIcon={<AddIcon />}
          >
            {creatingCategory ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para nuevo rubro */}
      <Dialog open={showNewRubroDialog} onClose={() => setShowNewRubroDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            Nuevo Rubro
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Nombre del rubro *" 
              value={newRubroName} 
              onChange={e => setNewRubroName(e.target.value)} 
              required 
              fullWidth 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} 
            />
            <TextField 
              label="Descripción (opcional)" 
              value={newRubroDescription} 
              onChange={e => setNewRubroDescription(e.target.value)} 
              fullWidth 
              multiline 
              rows={3} 
              placeholder="Describe el propósito de este rubro..." 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} 
            />
            <FormControl fullWidth>
              <InputLabel id="rubro-type-label">Tipo</InputLabel>
              <Select
                labelId="rubro-type-label"
                value={newRubroType}
                label="Tipo"
                onChange={e => setNewRubroType(e.target.value)}
                required
              >
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="empresa">Empresa</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowNewRubroDialog(false)}
            startIcon={<CancelIcon />}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateRubro} 
            variant="contained" 
            disabled={creatingRubro || !newRubroName.trim()}
            startIcon={<AddIcon />}
          >
            {creatingRubro ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Webcam Dialog */}
      {showWebcam && (
        <Suspense fallback={<LazyLoadingFallback />}>
          <LazyWebcamCapture
            onImageCapture={handleWebcamCapture}
            onClose={() => setShowWebcam(false)}
          />
        </Suspense>
      )}
    </Box>
  );
}

// Utility functions
const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    const result = reader.result as string;
    resolve(result.split(',')[1]);
  };
  reader.onerror = error => reject(error);
});

const formatDateForInput = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

export default InvoiceForm;
