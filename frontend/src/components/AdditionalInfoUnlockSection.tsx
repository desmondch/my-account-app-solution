import React, { useState } from "react";
import { apiService } from "../services/api";

type AdditionalInfoUnlockSectionProps = {
    onUnlockSuccess: () => void;
    title: string;
};


const AdditionalInfoUnlockSection: React.FC<AdditionalInfoUnlockSectionProps> = ({ onUnlockSuccess, title }) => {
    const [inputCode, setInputCode] = useState('');
    const [inputCodeIsValid, setInputCodeIsValid] = useState(false);
    const [inputCodeModified, setInputCodeModified] = useState(false);
    const [showCodeEntry, setShowCodeEntry] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [disableVerifyCodeButton, setDisableVerifyCodeButton] = useState(false);
    const [disableResendCodeButton, setDisableResendCodeButton] = useState(false);

    // Gets redeclared every time the page state changes
    const unlockDataHandler = async (_event: any) => {
        setErrorMessage(null)
        try {
            await apiService.requestCode()
            setShowCodeEntry(true)
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.toString())
                setErrorMessage(error.toString())
            }
        }
    }

    const onInputCodeChangeHandler: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setInputCode(event.target.value)
    }

    const onInputCodeBlurHandler: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setInputCodeModified(true);
        if (event.target.value.match(/^\d{6}$/)) {
            setInputCodeIsValid(true);
        } else {
            setInputCodeIsValid(false);
        }
    }

    const submitAuthCodeHandler = async (_event: any) => {
        try {
            setDisableVerifyCodeButton(true);
            await apiService.verifyCode(inputCode)
            onUnlockSuccess()
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.toString())
                setErrorMessage(error.toString())
            }
        } finally {
            setDisableVerifyCodeButton(false);
        }
    }

    const cancelAuthCodeHandler = (_event: any) => {
        setShowCodeEntry(false)
    }

    const resendAuthCodeHandler = async (_event: any) => {
        setErrorMessage(null)

        try {
            setDisableResendCodeButton(true);
            await apiService.requestCode();
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.toString())
                setErrorMessage(error.toString())
            }
        } finally {
            setDisableResendCodeButton(false);
        }
    }

    return (
        <div className="section">
            <div className="section-header">
                <h3>🔒{title}</h3>
            </div>
            <div className="section-body">
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {showCodeEntry === false &&
                    <button
                        className="btn btn-primary"
                        onClick={unlockDataHandler}
                    >
                        Unlock Sensitive Data
                    </button>
                }
                {showCodeEntry === true &&
                    <div className="form-group">
                        <label htmlFor="codeEntry">Authentication Code:</label>
                        <input
                            type="text"
                            id="codeEntry"
                            value={inputCode}
                            onChange={onInputCodeChangeHandler}
                            onBlur={onInputCodeBlurHandler}
                            placeholder="6-digit code"
                        />
                        {inputCodeModified && !inputCodeIsValid && <p style={{ color: 'red' }}>Please enter a 6-digit verification code</p>}
                        <br />
                        <button
                            className="btn btn-primary"
                            onClick={submitAuthCodeHandler}
                            disabled={disableVerifyCodeButton || !inputCodeIsValid}
                        >
                            Submit
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={cancelAuthCodeHandler}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={resendAuthCodeHandler}
                            disabled={disableResendCodeButton}
                        >
                            Resend Code
                        </button>
                    </div>
                }
            </div>
        </div>
    );
};

export default AdditionalInfoUnlockSection;
