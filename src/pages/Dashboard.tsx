import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import NoteEditor from '../components/NoteEditor';
import { noteService, INote } from '../services/noteService';

const Dashboard = () => {
  const [notes, setNotes] = useState<INote[]>([]);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      if (user?.email) {
        try {
          const userNotes = await noteService.getNotes(user.email);
          setNotes(userNotes);
        } catch (error: any) {
          console.error('Load notes error:', error);
          toast.error(error.message || 'Failed to load notes');
        }
      }
    };
    fetchNotes();
  }, [user]);

  const handleSaveNote = async (title: string, content: string) => {
    try {
      if (!user?.email) return;
      const newNote = await noteService.createNote(user.email, title, content);
      setNotes([...notes, newNote]);
      setIsNoteEditorOpen(false);
      toast.success('Note created successfully');
    } catch (error: any) {
      console.error('Create note error:', error);
      toast.error(error.message || 'Failed to create note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      setNotes(notes.filter(note => note._id !== id));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  return (
    <Box
      sx={{
        width: { xs: '95%', sm: '80%', md: 600 },
        margin: '0 auto',
        p: { xs: 1, sm: 2 },
        minHeight: '100vh',
        backgroundColor: '#F5F5F5'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 0 } }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="Logo"
            sx={{ width: 24, height: 24, mr: 1 }}
          />
          <Typography variant="h6">Dashboard</Typography>
        </Box>
        <Button color="primary" onClick={handleSignOut} sx={{ textTransform: 'none' }}>
          Sign Out
        </Button>
      </Box>

      {/* Welcome Card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Welcome, {user?.username || 'User'}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Email: {user?.email}
        </Typography>
      </Paper>

      {/* Create Note Button */}
      <Button fullWidth variant="contained" onClick={() => setIsNoteEditorOpen(true)} sx={{ mb: 3 }}>
        Create Note
      </Button>

      {/* Notes List */}
      <Typography variant="h6" sx={{ mb: 2 }}>Notes</Typography>
      <List>
        {notes.map(note => (
          <ListItem
            key={note._id}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              mb: 1,
              boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              p: { xs: 1, sm: 2 }
            }}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNote(note._id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={note.title} secondary={note.content} />
          </ListItem>
        ))}
      </List>

      {/* Note Editor Dialog */}
      <NoteEditor open={isNoteEditorOpen} onClose={() => setIsNoteEditorOpen(false)} onSave={handleSaveNote} />
    </Box>
  );
};

export default Dashboard;
