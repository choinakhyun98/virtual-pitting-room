import { faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { forwardRef, useImperativeHandle, useRef} from 'react'
import { Button } from './button';

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
    
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file && file.type.startsWith('image/')){
            const reader = new FileReader();
            reader.onload = ()=>{
                setImage(reader.result as string);
            }
            reader.readAsDataURL(file);
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