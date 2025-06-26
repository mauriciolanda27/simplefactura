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
  Chip
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import UploadIcon from '@mui/icons-material/Upload';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
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
  rubro?: string;
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
    rubro: initialData.rubro || "",
    categoryId: initialData.categoryId || ""
  });

  // Estados de error
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  
  // Estados para el diálogo de nueva categoría
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Cargar categorías del usuario
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesRes = await fetch('/api/categories');
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
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
        showInfo('Extrayendo datos de la factura...');
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
          
          showSuccess('Datos extraídos del documento. Por favor, verifique antes de guardar.');
        } catch (e) {
          console.error(e);
          showError('No se pudo extraer automáticamente. Complete manualmente los datos.');
        }
      })();
    }
  }, [file, showInfo, showSuccess, showError]);

  // Validación simple
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones obligatorias
    if (!formData.number_receipt?.trim()) newErrors.number_receipt = 'El número de recibo es obligatorio';
    if (!formData.purchase_date) newErrors.purchase_date = 'La fecha de compra es obligatoria';
    if (!formData.total_amount?.trim()) newErrors.total_amount = 'El monto total es obligatorio';
    if (!formData.vendor?.trim()) newErrors.vendor = 'El vendedor es obligatorio';
    if (!formData.rubro?.trim()) newErrors.rubro = 'El rubro es obligatorio';
    if (!formData.categoryId) newErrors.categoryId = 'La categoría es obligatoria';
    
    // Validaciones opcionales - solo verificar que no estén vacíos si se proporcionan
    if (formData.nit && !formData.nit.trim()) newErrors.nit = 'NIT no puede estar vacío';
    if (formData.nit_ci_cex && !formData.nit_ci_cex.trim()) newErrors.nit_ci_cex = 'NIT/CI/CEX no puede estar vacío';
    if (formData.authorization_code && !formData.authorization_code.trim()) newErrors.authorization_code = 'El código de autorización no puede estar vacío';
    if (formData.name && formData.name.length < 2) newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorFields = Object.keys(errors);
      showError(`Por favor, corrija los errores en los siguientes campos: ${errorFields.join(', ')}`);
      return;
    }
    
    console.log('Enviando factura con datos:', formData);
    console.log('Categoría seleccionada:', formData.categoryId);
    
    const method = initialData.id ? 'PUT' : 'POST';
    const url = initialData.id ? `/api/invoices/${initialData.id}` : '/api/invoices';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Error al guardar factura";
        throw new Error(errorMsg);
      }
      showSuccess('Factura guardada correctamente');
      if (onSaved) onSaved(data);
    } catch (e) {
      let errorMessage = "Error desconocido";
      if (e && typeof e === 'object' && 'message' in e) {
        errorMessage = String(e.message);
      }
      showError(errorMessage);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  // Process file (common function for both upload and drop)
  const processFile = (selectedFile: File) => {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      showError('Solo se permiten archivos JPG, PNG y PDF');
      return;
    }
    
    // Validar tamaño (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      showError('El archivo es demasiado grande. Máximo 10MB');
      return;
    }
    
    setFile(selectedFile);
    showInfo('Archivo seleccionado correctamente');
  };

  // Remove file
  const handleRemoveFile = () => {
    setFile(null);
    showInfo('Archivo removido');
  };

  // Función para crear nueva categoría
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showError('El nombre de la categoría es obligatorio');
      return;
    }

    setCreatingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Error al crear categoría";
        throw new Error(errorMsg);
      }

      // Agregar la nueva categoría a la lista
      const newCategory = data;
      setCategories(prev => [...prev, newCategory]);
      
      // Seleccionar automáticamente la nueva categoría
      setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
      
      // Limpiar el formulario y cerrar el diálogo
      setNewCategoryName("");
      setNewCategoryDescription("");
      setShowNewCategoryDialog(false);
      showSuccess('Categoría creada y seleccionada correctamente');
    } catch (error) {
      let errorMessage = "Error al crear categoría";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      showError(errorMessage);
    } finally {
      setCreatingCategory(false);
    }
  };

  // Componente de validación visual
  const ValidationStatus = ({ field }: { field: string }) => {
    const hasError = touched[field] && errors[field];
    const isValid = touched[field] && !errors[field] && formData[field as keyof typeof formData];
    
    if (!touched[field]) return null;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        {hasError ? (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="error">
              {errors[field]}
            </Typography>
          </>
        ) : isValid ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="success">
              Válido
            </Typography>
          </>
        ) : null}
      </Box>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {initialData.id ? 'Editar Factura' : 'Nueva Factura'}
      </Typography>

      <Stack spacing={3}>
        {/* Sección de Documento */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Documento de Factura
          </Typography>
          <Box sx={{ 
            border: '2px dashed', 
            borderColor: 'grey.300', 
            borderRadius: 2, 
            p: 3, 
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
                    sx={{ borderRadius: 0 }}
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
                    sx={{ borderRadius: 0 }}
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
                    sx={{ borderRadius: 0 }}
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
        </Box>

        {/* Información básica */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Información Básica
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <ValidationStatus field="vendor" />
            </Box>
          </Stack>
        </Box>

        {/* Monto y categorización */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Monto y Categorización
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <ValidationStatus field="total_amount" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Rubro *"
                value={formData.rubro}
                onChange={(e) => setFormData(prev => ({ ...prev, rubro: e.target.value }))}
                onBlur={() => setTouched(prev => ({ ...prev, rubro: true }))}
                error={touched.rubro && !!errors.rubro}
                helperText={touched.rubro ? errors.rubro : ''}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <ValidationStatus field="rubro" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth error={touched.categoryId && !!errors.categoryId}>
                <InputLabel>Categoría *</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, categoryId: true }))}
                  label="Categoría *"
                  sx={{ borderRadius: 0 }}
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
              <Button onClick={() => setShowNewCategoryDialog(true)} size="small" sx={{ mt: 1, mb: 2 }}>+ Agregar nueva categoría</Button>
              <Dialog open={showNewCategoryDialog} onClose={() => setShowNewCategoryDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nueva Categoría</DialogTitle>
                <DialogContent>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField label="Nombre de la categoría *" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />
                    <TextField label="Descripción (opcional)" value={newCategoryDescription} onChange={e => setNewCategoryDescription(e.target.value)} fullWidth multiline rows={3} placeholder="Describe el propósito de esta categoría..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowNewCategoryDialog(false)}>Cancelar</Button>
                  <Button onClick={handleCreateCategory} variant="contained" disabled={creatingCategory || !newCategoryName.trim()}>
                    {creatingCategory ? 'Guardando...' : 'Guardar'}
                  </Button>
                </DialogActions>
              </Dialog>
              <ValidationStatus field="categoryId" />
            </Box>
          </Stack>
        </Box>

        {/* Información fiscal */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Información Fiscal
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="NIT"
                value={formData.nit}
                onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                onBlur={() => setTouched(prev => ({ ...prev, nit: true }))}
                error={touched.nit && !!errors.nit}
                helperText={touched.nit ? errors.nit : ''}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <ValidationStatus field="authorization_code" />
            </Box>
          </Stack>
        </Box>

        {/* Información adicional */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Información Adicional
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Nombre/Razón Social"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                error={touched.name && !!errors.name}
                helperText={touched.name ? errors.name : ''}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <ValidationStatus field="number_receipt" />
            </Box>
          </Stack>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{ borderRadius: 0 }}
          >
            {initialData.id ? 'Actualizar Factura' : 'Guardar Factura'}
          </Button>
        </Box>
      </Stack>

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
