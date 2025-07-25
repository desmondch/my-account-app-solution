import React, { useState } from "react";
import { apiService } from "../services/api";

type AdditionalInfoUnlockSectionProps = {
    onUnlockSuccess: () => void;
    title: string;
};


const AdditionalInfoUnlockSection: React.FC<AdditionalInfoUnlockSectionProps> = ({ onUnlockSuccess, title }) => {
    const [inputCode, setInputCode] = useState('');
    const [showCodeEntry, setShowCodeEntry] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    const onInputCodeChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setInputCode(event.target.value)
    }

    const submitAuthCodeHandler = async(_event: any) => {
        try {
            await apiService.verifyCode(inputCode)
            onUnlockSuccess()
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.toString())
                setErrorMessage(error.toString())
            }
        }
    }

    const cancelAuthCodeHandler = (_event: any) => {
        setShowCodeEntry(false)
    }

    return (
        <div className="section">
            <div className="section-header">
                <h3>🔒{title}</h3>
            </div>
            <div className="section-body">
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
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
                            onChange={onInputCodeChange}
                            placeholder="6-digit code"
                        />
                        <br />
                        <button
                            className="btn btn-primary"
                            onClick={submitAuthCodeHandler}
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
