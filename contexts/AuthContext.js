import React, { createContext, useContext, useState, useEffect } from 'react';

import { auth, db } from '../config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth'; 
import { ref, get, set } from 'firebase/database'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função interna para criar estrutura inicial do usuário no Realtime Database
  const createInitialUserData = async (firebaseUser) => {
    try {
      console.log(`[AuthContext] Criando dados iniciais para usuário ${firebaseUser.uid}`);

      const initialUserData = {
        email: firebaseUser.email,
        nome: firebaseUser.displayName || 'Novo Usuário',
        perfil: 'aluno',
        dataCriacao: new Date().toISOString()
      };

      // Salva dados principais em /usuarios
      await set(ref(db, `usuarios/${firebaseUser.uid}`), initialUserData);

      // Se o perfil for 'aluno', cria estrutura em /alunos
      if (initialUserData.perfil === 'aluno') {
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

  // Função para carregar dados completos do usuário a partir do Firebase
  const loadUserData = async (firebaseUser) => {
    try {
      console.log(`[AuthContext] Carregando dados para usuário: ${firebaseUser.uid}`);

      const userRef = ref(db, `usuarios/${firebaseUser.uid}`);
      const userSnapshot = await get(userRef);

      let userData = {};
      if (!userSnapshot.exists()) {
        console.log('[AuthContext] Dados do usuário não encontrados, criando dados iniciais.');
        userData = await createInitialUserData(firebaseUser);
      } else {
        userData = userSnapshot.val();
        console.log('[AuthContext] Dados do usuário encontrados:', userData);
      }

      // Busca dados adicionais se o perfil for 'aluno'
      let alunoData = {};
      if (userData.perfil === 'aluno') {
        const alunoRef = ref(db, `alunos/${firebaseUser.uid}`);
        const alunoSnapshot = await get(alunoRef);
        if (alunoSnapshot.exists()) {
          alunoData = alunoSnapshot.val();
          if (!alunoData.foto && firebaseUser.photoURL) {
            alunoData.foto = firebaseUser.photoURL;
          }
          console.log('[AuthContext] Dados de aluno:', alunoData);
        } else {
            console.warn('[AuthContext] Dados de aluno não encontrados. Criando estrutura básica...');
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
        ...userData,
        ...alunoData
      };

    } catch (error) {
      console.error('[AuthContext] Erro ao carregar ou criar dados:', error);
      setError(error);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Usuário',
        photoURL: firebaseUser.photoURL || '',
        perfil: 'aluno',
        esportes: [],
        error: error.message
      };
    }
  };

  // Monitora o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      try {
        if (firebaseUser) {
          console.log('[AuthContext] Usuário autenticado:', firebaseUser.uid);
          const userData = await loadUserData(firebaseUser);
          setUser(userData);
        } else {
          console.log('[AuthContext] Nenhum usuário autenticado');
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthContext] Erro no listener de autenticação:', err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Função para forçar o recarregamento dos dados do usuário
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