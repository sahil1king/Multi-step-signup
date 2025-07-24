import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';

// --- CONTEXT AND REDUCER ---
const SignupContext = createContext();

const initialState = {
  currentStep: 1,
  formData: {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  },
  formErrors: {},
  isLoading: false,
  isSuccess: false,
};

function signupReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        formErrors: { ...state.formErrors, [Object.keys(action.payload)[0]]: null },
      };
    case 'SET_ERRORS':
      return { ...state, formErrors: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1 };
    case 'PREV_STEP':
      return { ...state, currentStep: state.currentStep - 1 };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SUBMIT_SUCCESS':
      return { ...state, isLoading: false, isSuccess: true, formErrors: {} };
    case 'SUBMIT_FAILURE':
      return { ...state, isLoading: false, formErrors: { ...state.formErrors, submit: action.payload } };
    case 'RESET_FORM':
      return { ...initialState };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const SignupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(signupReducer, initialState);
  const value = { state, dispatch };
  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
};

export const useSignupContext = () => {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignupContext must be used within a SignupProvider');
  }
  return context;
};


// --- UTILITY & VALIDATION ---
const validateStep1 = (data) => {
  const errors = {};
  if (!data.firstName.trim()) errors.firstName = 'First name is required.';
  else if (!/^[a-zA-Z\s]+$/.test(data.firstName)) errors.firstName = 'First name can only contain letters and spaces.';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required.';
  else if (!/^[a-zA-Z\s]+$/.test(data.lastName)) errors.lastName = 'Last name can only contain letters and spaces.';
  if (!data.email) errors.email = 'Email is required.';
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Please enter a valid email address.';
  return errors;
};

const validateStep2 = (data) => {
  const errors = {};
  if (!data.address.trim()) errors.address = 'Street address is required.';
  if (!data.city.trim()) errors.city = 'City is required.';
  if (!data.state.trim()) errors.state = 'State is required.';
  if (!data.zipCode.trim()) errors.zipCode = 'ZIP code is required.';
  else if (!/^\d{6}$/.test(data.zipCode)) errors.zipCode = 'Please enter a valid 6-digit ZIP code.';
  if (!data.phone.trim()) errors.phone = 'Phone number is required.';
  else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) errors.phone = 'Please enter a valid 10-digit phone number.';
  return errors;
};


// --- CORE COMPONENTS ---
const StepIndicator = () => {
  const { state } = useSignupContext();
  const steps = ['Personal Info', 'Address Details', 'Review'];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = state.currentStep > stepNumber;
        const isActive = state.currentStep === stepNumber;

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  isActive ? 'bg-blue-600 text-white scale-110' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  stepNumber
                )}
              </div>
              <p className={`mt-2 text-sm font-semibold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{step}</p>
            </div>
            {stepNumber < steps.length && (
              <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${isCompleted ? 'border-green-500' : 'border-gray-200'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const FormInput = React.forwardRef(({ id, label, ...props }, ref) => {
    const { state } = useSignupContext();
    const error = state.formErrors[id];
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                ref={ref}
                id={id}
                name={id}
                className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                aria-invalid={!!error}
                {...props}
            />
            {error && <p className="mt-2 text-sm text-red-600" aria-live="polite">{error}</p>}
        </div>
    );
});


// --- STEP COMPONENTS ---
const Step1_NameEmail = () => {
  const { state, dispatch } = useSignupContext();
  const { formData } = state;
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { [e.target.name]: e.target.value } });
  };

  return (
    <fieldset>
        <legend className="text-lg font-medium text-gray-900 mb-4">Step 1: Personal Information</legend>
        <div className="space-y-4">
            <FormInput ref={firstInputRef} id="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
            <FormInput id="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
            <FormInput id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} required />
        </div>
    </fieldset>
  );
};

const Step2_AddressPhone = () => {
  const { state, dispatch } = useSignupContext();
  const { formData } = state;
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { [e.target.name]: e.target.value } });
  };

  return (
    <fieldset>
        <legend className="text-lg font-medium text-gray-900 mb-4">Step 2: Address Details</legend>
        <div className="space-y-4">
            <FormInput ref={firstInputRef} id="address" label="Street Address" value={formData.address} onChange={handleChange} required />
            <FormInput id="city" label="City" value={formData.city} onChange={handleChange} required />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput id="state" label="State" value={formData.state} onChange={handleChange} required />
                <FormInput id="zipCode" label="ZIP Code" value={formData.zipCode} onChange={handleChange} required />
            </div>
            <FormInput id="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleChange} required />
        </div>
    </fieldset>
  );
};

const ReviewDataItem = ({ label, value }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'Not provided'}</dd>
    </div>
);

const Step3_Review = () => {
    const { state } = useSignupContext();
    const { formData } = state;
    return (
        <fieldset>
            <legend className="text-lg font-medium text-gray-900 mb-4">Step 3: Review Your Information</legend>
            <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-md border border-gray-200">
                <dl className="divide-y divide-gray-200">
                    <ReviewDataItem label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
                    <ReviewDataItem label="Email Address" value={formData.email} />
                    <ReviewDataItem label="Address" value={`${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`} />
                    <ReviewDataItem label="Phone Number" value={formData.phone} />
                </dl>
            </div>
        </fieldset>
    );
};

const SuccessMessage = () => {
    const { dispatch } = useSignupContext();
    return (
        <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-900">Thank you for signing up!</h3>
            <p className="mt-2 text-gray-600">Your registration was successful.</p>
            <div className="mt-6">
                <button
                    onClick={() => dispatch({ type: 'RESET_FORM' })}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Start Over
                </button>
            </div>
        </div>
    );
};

const SignupForm = () => {
  const { state, dispatch } = useSignupContext();
  const { currentStep, formData, formErrors, isLoading, isSuccess } = state;

  const handleNext = () => {
    let errors = {};
    if (currentStep === 1) errors = validateStep1(formData);
    if (currentStep === 2) errors = validateStep2(formData);

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const handleSubmit = () => {
    // Re-validate all fields before final submission
    const step1Errors = validateStep1(formData);
    const step2Errors = validateStep2(formData);
    const allErrors = { ...step1Errors, ...step2Errors };

    if (Object.keys(allErrors).length > 0) {
        dispatch({ type: 'SET_ERRORS', payload: allErrors });
        // Optionally, navigate to the first step with an error
        if (Object.keys(step1Errors).length > 0) {
            // dispatch({ type: 'GO_TO_STEP', payload: 1 }); // A reducer action could be added for this
        } else if (Object.keys(step2Errors).length > 0) {
            // dispatch({ type: 'GO_TO_STEP', payload: 2 });
        }
        return; // Stop submission if there are errors
    }


    dispatch({ type: 'SET_LOADING', payload: true });
    console.log('Submitting Data:', formData);

    // Simulate API call
    setTimeout(() => {
      // Simulate a 50/50 chance of success/failure
      if (Math.random() > 0.5) {
        dispatch({ type: 'SUBMIT_SUCCESS' });
      } else {
        dispatch({ type: 'SUBMIT_FAILURE', payload: 'An unexpected error occurred. Please try again.' });
      }
    }, 2000);
  };

  if (isSuccess) {
    return <SuccessMessage />;
  }

  return (
    <form className="space-y-8" noValidate onSubmit={(e) => e.preventDefault()}>
      <StepIndicator />
      
      <div className="min-h-[300px]">
        {currentStep === 1 && <Step1_NameEmail />}
        {currentStep === 2 && <Step2_AddressPhone />}
        {currentStep === 3 && <Step3_Review />}
      </div>

      {formErrors.submit && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">{formErrors.submit}</div>}

      <div className="flex justify-between pt-5">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
        )}
        <div className="flex-grow"></div>
        {currentStep < 3 && (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next
          </button>
        )}
        {currentStep === 3 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </form>
  );
};

// --- MAIN APP ---
export default function App() {
  return (
    <SignupProvider>
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <SignupForm />
            </div>
        </div>
    </SignupProvider>
  );
}
