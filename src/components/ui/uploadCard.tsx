import { faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { forwardRef, useImperativeHandle, useRef} from 'react'
import { Button } from './button';
import imageCompression from 'browser-image-compression';

interface Props{
    title: string;
    icon: IconDefinition;
    image: string | null;
    setImage: (url: string | null) => void;
}

// ✅ 부모에게 노출시킬 함수의 타입을 정의합니다.
export interface UploadCardHandle {
  clearFileInput: () => void;
}

// ✅ Blob을 항상 File 형태로 맞춰 사파리 Blob 리더 버그를 회피
const ensureFile = (file: File | Blob, fallbackName = 'upload.jpg'): File => {
    if (file instanceof File) {
        return file;
    }

    const type = file.type || 'image/jpeg';
    return new File([file], fallbackName, { type });
};

// ✅ FileReader가 모바일 Safari에서 실패할 때를 대비해 다중 폴백을 제공
const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = () => resolve(reader.result as string);
        
        reader.onerror = (error) => {
            console.error('fileToBase64 - FileReader 오류 발생:', error);
            // 최종 실패 시 이 메시지를 통해 메모리 부족임을 유추할 수 있도록 합니다.
            reject(new Error("파일을 Base64로 변환하는 중 읽기 오류 발생 (메모리 부족 의심)")); 
        };
    });
};

const UploadCard = forwardRef<UploadCardHandle, Props>(({title, icon, image, setImage},ref) => {

    const fileRef = useRef<HTMLInputElement>(null);

    // ✅ useImperativeHandle를 사용해 부모가 ref.current.clearFileInput()을 호출할 수 있게 합니다.
    useImperativeHandle(ref, () => ({
      clearFileInput: () => {
        if (fileRef.current) {
          fileRef.current.value = '';
        }
      }
    }));
    
    const onClick = ()=>{
        fileRef.current?.click();
    }

    const onDelete = ()=>{
        setImage(null);
    // ✅ 파일 input 값도 초기화 (같은 파일 다시 업로드할 때 필요)
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    }
    
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (!file || !file.type.startsWith('image/')) {
            return;
        }

        // ✅ 3. 파일 크기 사전 제한 (5MB) - 초기 로드 실패 방지
        const MAX_FILE_SIZE_MB = 5; 
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            alert(`업로드 실패: 파일 크기가 ${MAX_FILE_SIZE_MB}MB를 초과합니다. 더 작은 파일을 선택해 주세요.`);
            if (fileRef.current) fileRef.current.value = '';
            return;
        }

        // ✅ 1. 가장 보수적인 압축 옵션 설정 (메모리 부하 최소화)
        const options = {
            maxSizeMB: 0.5,             
            maxWidthOrHeight: 720,      // 720px로 설정하여 메모리 사용량 최소화
            useWebWorker: true,         
            fileType: 'image/jpeg',     
        };

        try {
            console.log(`압축 전 파일 크기: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            
            let finalFile: File | Blob;
            
            // --- 1차 시도: 이미지 압축 시도 ---
            try {
                const compressedFile = await imageCompression(file, options);
                
                if (!compressedFile || compressedFile.size === 0) {
                     throw new Error("압축 결과 파일 크기가 0입니다.");
                }

                console.log(`압축 후 파일 크기: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
                finalFile = compressedFile;

            } catch (compressionError) {
                // ✅ 2. 압축 실패 시, 원본 파일로 폴백(Fallback)
                console.warn('이미지 압축 실패. 원본 파일로 변환을 시도합니다.', compressionError);
                finalFile = file;
                alert("이미지 압축에 실패했습니다. 원본 파일로 변환을 시도합니다. 잠시만 기다려 주세요.");
            }

            // --- 2차 시도: 최종 파일을 Base64로 변환 (메모리 문제 발생 가능 지점) ---
            if (!finalFile || finalFile.size === 0) {
                 throw new Error("처리할 이미지 파일이 최종적으로 유효하지 않습니다.");
            }
            
            const base64Image = await fileToBase64(finalFile);

            setImage(base64Image);

        } catch (error) {
            // --- 최종 에러 처리 및 메모리 부족 안내 ---
            console.error('이미지 처리 중 최종 오류 발생:', error);

            let errorMessage = "이미지를 처리하는 중 알 수 없는 오류가 발생했습니다. 다른 파일을 시도해 주세요.";
            
            if (error instanceof Error) {
                // Base64 변환 실패 (메모리 부족 의심) 에러 메시지 포함
                errorMessage = error.message; 
            } 
            
            // 최종 실패 시, 파일 입력창 리셋 및 사용자 안내
            alert(`업로드 실패: ${errorMessage}\n\n💡 해결책: 파일이 너무 커서 발생했을 수 있습니다. 더 작은 파일을 선택해 주세요.`);
            
            if (fileRef.current) {
                fileRef.current.value = '';
            }
            setImage(null);
        }
    }

    return (
        <div className="flex flex-col w-full pt-5 pb-5 border-2 border-dashed border-gray-300 rounded-4xl cursor-pointer hover:bg-gray-50 hover:border-[#A0A0FF]">
                <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onFileChange}
                />
                {!image ? (
                    <div className="flex flex-col items-center justify-center gap-5 pt-5" onClick={onClick}>
                        <FontAwesomeIcon icon={icon} className="text-[#A0A0FF] text-[50px]"/>
                        <p className="text-center scroll-m-20 text-sm lg:text-xl font-bold tracking-tight text-gray-800">
                            {title}
                        </p>
                        <Button 
                            variant="outline" 
                            className="min-w-[150px] cursor-pointer text-[#A0A0FF] hover:text-white hover:bg-[#A0A0FF]"
                        >
                            업로드
                        </Button>
                    </div>
                ) : (
                        <div className='relative w-1/2 h-full rounded-md mx-auto'>
                            <img src={image} alt="@IMG"/>
                            <FontAwesomeIcon 
                                icon={faXmark} 
                                className='absolute -top-2 -right-2 border-2 border-gray-200 rounded-full text-red-500 hover:text-white hover:bg-red-400 hover:border-red-400'
                                onClick={onDelete}
                            />
                        </div>
                )}
        </div>
    )
})

export default UploadCard