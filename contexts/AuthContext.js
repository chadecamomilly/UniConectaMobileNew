import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { router } from 'expo-router';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createInitialUserData = async (firebaseUser) => {
    try {
      console.log(`[AuthContext] Criando dados iniciais para usuário ${firebaseUser.uid}`);

      const initialUserData = {
        email: firebaseUser.email,
        nome: firebaseUser.displayName || 'Novo Usuário',
        tipo: 'aluno',
        dataCriacao: new Date().toISOString()
      };

      await set(ref(db, `usuarios/${firebaseUser.uid}`), initialUserData);

      if (initialUserData.tipo === 'aluno') {
        const initialAlunoData = {
          foto: firebaseUser.photoURL || '',
          nome: firebaseUser.displayName || 'Novo Usuário',
          esportes: [] 
        };
        await set(ref(db, `alunos/${firebaseUser.uid}`), initialAlunoData);
      }

      return initialUserData;
    } catch (error) {
      console.error('[AuthContext] Erro ao criar dados iniciais:', error);
      setError(error);
      throw error;
    }
  };

  const loadUserData = async (firebaseUser) => {
    try {
      console.log(`[AuthContext] Carregando dados para usuário: ${firebaseUser.uid}`);

      const userRef = ref(db, `usuarios/${firebaseUser.uid}`);
      const userSnapshot = await get(userRef);

      let userDataFromDb = {};
      if (!userSnapshot.exists()) {
        console.log('[AuthContext] Dados do usuário no DB não encontrados, criando dados iniciais.');
        userDataFromDb = await createInitialUserData(firebaseUser);
      } else {
        userDataFromDb = userSnapshot.val();
        console.log('[AuthContext] Dados do usuário encontrados do DB:', userDataFromDb);
      }

      let alunoData = {};
      let userEsportes = []; 
      if (userDataFromDb.tipo === 'aluno' || userDataFromDb.tipo === 'responsavel') { 
        const alunoRef = ref(db, `alunos/${firebaseUser.uid}`); 
        const alunoSnapshot = await get(alunoRef);
        if (alunoSnapshot.exists()) {
          alunoData = alunoSnapshot.val();
          userEsportes = alunoData.esportes || []; 
          if (!alunoData.foto && firebaseUser.photoURL) {
            alunoData.foto = firebaseUser.photoURL;
          }
          console.log('[AuthContext] Dados adicionais (aluno/responsável):', alunoData);
        } else {
          console.warn('[AuthContext] Dados adicionais não encontrados. Criando estrutura básica...');
          alunoData = {
            foto: firebaseUser.photoURL || '',
            nome: firebaseUser.displayName || 'Novo Usuário',
            esportes: []
          };
          await set(ref(db, `alunos/${firebaseUser.uid}`), alunoData);
        }
      }

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        perfil: userDataFromDb.tipo,
        meusEsportes: userEsportes, 
        ...userDataFromDb,
        ...alunoData
      };

    } catch (error) {
      console.error('[AuthContext] Erro ao carregar ou criar dados do usuário:', error);
      setError(error);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Usuário',
        photoURL: firebaseUser.photoURL || '',
        perfil: 'aluno',
        meusEsportes: [], 
        esportes: [],
        error: error.message
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      try {
        if (firebaseUser) {
          console.log('[AuthContext] Usuário autenticado pelo Firebase Auth:', firebaseUser.uid);
          const userFullData = await loadUserData(firebaseUser);
          setUser(userFullData);
        } else {
          console.log('[AuthContext] Nenhum usuário autenticado no Firebase Auth');
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthContext] Erro no listener de autenticação (onAuthStateChanged):', err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (!auth.currentUser) {
      console.log('[AuthContext] Nenhum usuário autenticado para refresh.');
      return false;
    }

    try {
      setLoading(true);
      const updatedData = await loadUserData(auth.currentUser);
      setUser(updatedData);
      return true;
    } catch (error) {
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      console.log('[AuthContext] Logout realizado com sucesso.');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('[AuthContext] Erro no logout:', error);
      setError(error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}