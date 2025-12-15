import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { login, clearError } from '../store/slices/authSlice';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  useEffect(() => {
    console.log('Login useEffect - user changed:', user);
    if (user) {
      console.log('User exists, navigating to home...');
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginForm) => {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Form data:', data);
    
    // Clear any existing errors
    dispatch(clearError());
    
    try {
      // Direct API call first to test
      console.log('Testing direct API call...');
      const directResponse = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const directData = await directResponse.json();
      console.log('Direct API response:', directData);
      
      if (directResponse.ok && directData.success && directData.data) {
        // Store token and user data directly
        localStorage.setItem('token', directData.data.token);
        
        // Use Redux action
        const result = await dispatch(login(data)).unwrap();
        console.log('Redux login successful:', result);
        
        toast.success('登录成功！');
        navigate('/');
      } else {
        throw new Error(directData.message || '登录失败');
      }
    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', error);
      
      const errorMessage = error?.message || '登录失败';
      toast.error(errorMessage);
    }
    console.log('=== LOGIN ATTEMPT END ===');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><strong>Student:</strong> john@student.apiu.edu / password</p>
              <p><strong>Staff:</strong> staff@apiu.edu / password</p>
              <p><strong>Admin:</strong> admin@apiu.edu / password</p>
              <p><strong>Finance Manager:</strong> finance@apiu.edu / password</p>
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button 
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  className="px-3 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300 text-xs"
                >
                  清除缓存
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: 'admin@apiu.edu', password: 'password' })
                      });
                      const data = await response.json();
                      if (data.success) {
                        localStorage.setItem('token', data.data.token);
                        window.location.href = '/';
                      } else {
                        alert('登录失败: ' + data.message);
                      }
                    } catch (err) {
                      alert('API错误: ' + err);
                    }
                  }}
                  className="px-3 py-2 bg-green-200 text-green-700 rounded hover:bg-green-300 text-xs"
                >
                  快速登录
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: 'admin@apiu.edu', password: 'password' })
                      });
                      const data = await response.json();
                      alert(`API: ${response.status} - ${data.success ? '成功' : '失败'}`);
                    } catch (err) {
                      alert('错误: ' + err);
                    }
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                >
                  测试API
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

