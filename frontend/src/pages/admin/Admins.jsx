import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminManagementService } from '../../services/adminService';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff Admin',
  });

  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await adminManagementService.getAll();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role,
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Staff Admin',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAdmin(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await adminManagementService.update(editingAdmin.id, updateData);
      } else {
        await adminManagementService.create(formData);
      }
      await fetchAdmins();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving admin:', error);
      alert(error.response?.data?.message || 'Error saving admin');
    }
  };

  const handleDeactivate = async (adminId) => {
    if (confirm('Are you sure you want to deactivate this admin?')) {
      try {
        await adminManagementService.deactivate(adminId);
        await fetchAdmins();
      } catch (error) {
        console.error('Error deactivating admin:', error);
      }
    }
  };

  const handleDelete = async (adminId) => {
    if (
      confirm(
        'Are you sure you want to delete this admin? This action cannot be undone.'
      )
    ) {
      try {
        await adminManagementService.delete(adminId);
        await fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        Admin Management
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Manage administrator accounts and permissions
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              All Administrators
            </Typography>
            {currentUser.role === 'Super Admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: '#1a1a1a',
                  '&:hover': { bgcolor: '#333' },
                  textTransform: 'none',
                }}
              >
                Add Admin
              </Button>
            )}
          </Box>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow
                    key={admin.id}
                    sx={{
                      '&:hover': { bgcolor: '#fafafa' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {admin.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {admin.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={admin.role}
                        size="small"
                        sx={{
                          bgcolor:
                            admin.role === 'Super Admin' ? '#000' : '#757575',
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={admin.isActive ? 'active' : 'inactive'}
                        size="small"
                        sx={{
                          bgcolor: admin.isActive ? '#4CAF50' : '#9e9e9e',
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(admin)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {currentUser.role === 'Super Admin' &&
                          admin.id !== currentUser.id &&
                          admin.isActive && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleDeactivate(admin.id)}
                              sx={{
                                textTransform: 'none',
                                minWidth: 'auto',
                                px: 1,
                              }}
                            >
                              Deactivate
                            </Button>
                          )}
                        {!admin.isActive &&
                          currentUser.role === 'Super Admin' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(admin.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingAdmin}
                fullWidth
                helperText={
                  editingAdmin ? 'Leave blank to keep current password' : ''
                }
              />
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                  <MenuItem value="Staff Admin">Staff Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#1a1a1a',
                '&:hover': { bgcolor: '#333' },
                textTransform: 'none',
              }}
            >
              {editingAdmin ? 'Save Changes' : 'Add Admin'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
