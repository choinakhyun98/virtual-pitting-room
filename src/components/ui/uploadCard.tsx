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
            maxSizeMB: 0.3,           // 최대 파일 크기 (1MB)
            maxWidthOrHeight: 1024, // 최대 너비 또는 높이 (1024px)
            useWebWorker: true,     // 성능 향상을 위해 웹 워커 사용
        };

        try {
            console.log(`압축 전 파일 크기: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

            // ✅ 이미지 압축 실행
            const compressedFile = await imageCompression(file, options);

            console.log(`압축 후 파일 크기: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            
            // ✅ 압축된 파일을 Base64로 변환
            const reader = new FileReader();
            reader.onload = ()=>{
                setImage(reader.result as string);
            }
            // 원본 'file' 대신 'compressedFile'을 읽도록 수정
            reader.readAsDataURL(compressedFile);

        } catch (error) {
            console.error('이미지 압축 중 오류 발생:', error);
            alert('이미지를 처리하는 중 오류가 발생했습니다. 다른 파일을 시도해 주세요.');
            // ✅ 오류 발생 시 파일 입력 초기화
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