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

// ✅ [새로 추가] FileReader를 Promise로 감싸는 헬퍼 함수
// 이 함수는 컴포넌트 외부에 위치시켜도 됩니다.
const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error); // 👈 에러가 발생하면 catch로 전달
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
        if(!file || !file.type.startsWith('image/')){
            return;
        }

        // ✅ 이미지 압축 옵션 설정
        // 이 옵션으로 대부분의 이미지가 1MB 미만(주로 0.5MB 이하)이 됩니다.
        const options = {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            // ✅ [수정] 파일 타입을 JPEG로 강제합니다. (압축률 향상 및 표준화)
            fileType: 'image/jpeg', 
        };

        try {
            console.log(`압축 전 파일 크기: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

            const compressedFile = await imageCompression(file, options);

            console.log(`압축 후 파일 크기: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

            // ✅ [추가] 압축된 파일이 0바이트인지 확인합니다.
            if (compressedFile.size === 0) {
                // 0바이트 파일이면 '파일 읽기 오류' 대신 더 명확한 에러를 발생시킵니다.
                throw new Error("압축 결과 파일 크기가 0입니다. (압축 실패)");
            }
            
            const base64Image = await fileToBase64(compressedFile);

            setImage(base64Image);

        } catch (error) {
            console.error('이미지 처리 중 오류 발생:', error);

            let errorMessage = "이미지를 처리하는 중 오류가 발생했습니다. 다른 파일을 시도해 주세요.";
            
            // ✅ [수정] 우리가 발생시킨 에러를 포함하여 더 명확한 메시지 표시
            if (error instanceof Error) {
                errorMessage = error.message; // "압축 결과 파일 크기가 0입니다."
            } else if (error instanceof ProgressEvent) {
                errorMessage = "파일 읽기 오류가 발생했습니다. (ProgressEvent)";
            }

            alert(errorMessage);
            
            if (fileRef.current) {
              fileRef.current.value = '';
            }
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