import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Text, VStack, Input, Button, Link, Field } from '@chakra-ui/react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

const ResetPasswordModal: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [step, setStep] = useState<'reset' | 'verify' | 'new'>('reset');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const navigate = useNavigate();

    const handleSendCode = async () => {
        try {
            await resetPassword({ username: email });
            setStep('verify');
        } catch (error) {
            alert(error || "Failed to send verification code");
        }
    };

    const handleResendCode = async () => {
        try {
            await resetPassword({ username: email });
        } catch (error) {
            alert(error || "Failed to send verification code");
        }
    };

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            alert("Passwords need to match")
            return
        }

        try {
            await confirmResetPassword({ username: email, confirmationCode: code, newPassword: password });
            alert('Password reset successful!');
            navigate('/login');
        } catch (error) {
            alert(code)
            alert(error || "Failed to set new password");
        }
    };

    const fieldHeaderStyles = {
        color: 'neutral.800',
        fontFamily: 'inter',
        fontSize: 'sm',
        fontWeight: '600',
    };

    const placeholderStyles = {
        color: 'neutral.300',
        fontFamily: 'inter',
        fontSize: 'sm',
        fontWeight: '400',
    };

    return (
       
            <Box
                maxW="500px"
                w="full"
                bg="white"
                p={8}
                borderRadius="xl"
                boxShadow="xl"
            >
                <VStack gap={10} align="stretch">
                <Box>
                    <Text textStyle="h1" >{step === 'reset' ? 'Reset Password' : step === 'verify' ? 'Enter Verification Code' : 'Enter New Password'}</Text>
                    <Text color="#52525B" textStyle="p2" mt={2}>
                    {step === 'reset' ? 'To reset your password please enter the email associated with your account.' : step === 'verify' ? 'To reset your password please enter the verification code sent to your account.' : 'Please set a new password.'}
                    </Text>
                </Box>

                <Field.Root required>
                    <Field.Label {...fieldHeaderStyles}>
                        {step === 'reset' ? 'Email' : step === 'verify' ? 'Verification Code' : 'New Password'}
                    </Field.Label>
                    <Input
                        key={step}
                        type={step === 'new' ? 'password' : 'text'}
                        borderColor="neutral.100"
                        placeholder={step === 'reset' ? 'Enter Email' : step === 'verify' ? 'Enter Code' : 'Enter new password'}
                        textStyle="p2"
                        color="neutral.700"
                        _placeholder={{...placeholderStyles}}
                        onChange={step === "verify" ? e => setCode(e.target.value) : step === "new" ?  e => setPassword(e.target.value) : e => setEmail(e.target.value)}
                    />
                </Field.Root>

                {step === 'new' && 
                <Field.Root required>
                    <Field.Label {...fieldHeaderStyles}>
                        Confirm Password
                    </Field.Label>
                    <Input
                        type="password"
                        borderColor="neutral.100"
                        placeholder="Confirm Password"
                        textStyle="p2"
                        color="neutral.700"
                        _placeholder={{...placeholderStyles}}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                </Field.Root>
                }

                {step === 'verify' && 
                    <Button
                        bgColor='white'
                        w="full"
                        onClick={handleResendCode}
                        border="1px solid"
                        color="neutral.800"
                        textStyle="p2"
                        fontWeight={600}
                        mt={8}
                    >
                    Resend Code
                    </Button>
                }

                <Button
                    bgColor='neutral.800'
                    w="full"
                    onClick={step === 'new' ? handleResetPassword: step === 'reset' ? handleSendCode : () => setStep('new')}
                    borderRadius={5}
                    color="white"
                    textStyle="p2"
                    fontWeight={600}
                    mt={step === 'verify' ? 0 : 8}
                    disabled={step === 'reset' || step === 'verify' ? !email : !password || !confirmPassword}
                >
                    {step === 'reset' ? 'Send Verification Code' : step === 'verify' ? 'Submit' : 'Reset Password'}
                </Button>

                
                </VStack>
                <Text textStyle="p2" color="neutral.600" textAlign="center" mt={6} mb={10}>
                    Return to {' '}
                    <Link textStyle="p2" color="neutral.600" onClick={() => navigate('/login')} variant="underline">
                    Login
                    </Link>
                </Text>
            </Box>
    )

}

export default ResetPasswordModal