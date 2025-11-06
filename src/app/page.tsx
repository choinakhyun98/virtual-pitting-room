'use client'
import { Button } from "@/components/ui/button";
import { faDownload, faFaceSmile, faShirt } from "@fortawesome/free-solid-svg-icons";
import UploadCard, { UploadCardHandle } from '@/components/ui/uploadCard';
import { useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { imageCreator } from "@/service/imageCreator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Home() {

  const [userImage,setUserImage] = useState<string | null>(null);
  const [clothImage,setClothImage] = useState<string | null>(null);
  const [resultImage,setResultImage] = useState<string | null | undefined>(null);
  const [isLoading,setIsLoading] = useState<boolean>(false);

  // ✅ 두 UploadCard 컴포넌트를 가리킬 ref를 생성합니다.
  const userImageCardRef = useRef<UploadCardHandle>(null);
  const clothImageCardRef = useRef<UploadCardHandle>(null);
  
  //결과 이미지 가져오기
  const getImage = async () => {
    if (!userImage || !clothImage) {
      alert("두 이미지를 모두 업로드해주세요!");
      return;
    }

    try {
      setIsLoading(true);
      const result = await imageCreator(userImage, clothImage);
      if(resultImage === undefined || null){
        throw new Error("이미지 결과를 가져오지 못했습니다.");
      }
      setResultImage(result);
    } catch (error) {
      console.error(error);
      alert("이미지 생성 중 오류가 발생했습니다. error: " + error);
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ '처음부터' 버튼 핸들러
  const handleStartOver = () => {
    setUserImage(null);
    setClothImage(null);
    setResultImage(null);
    // ✅ ref를 사용해 자식 컴포넌트의 파일 입력을 초기화합니다.
    userImageCardRef.current?.clearFileInput();
    clothImageCardRef.current?.clearFileInput();
  };

  // ✅ '다시 입어보기' 버튼 핸들러
  const handleTryAgain = () => {
    setResultImage(null); // 결과 이미지만 숨김
    getImage(); // ✅ 곧바로 getImage 함수를 호출하여 로딩 시작
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center overflow-auto">
      {/* 사이트 환영 section */}
      <section className="max-w-[1440px] w-full min-h-3/10 mb-20 mt-20">
        <p className="text-center scroll-m-20 pb-2 text-4xl font-bold tracking-tight text-gray-800">
          가상 피팅룸에 오신 걸 환영합니다!
        </p>
        <p className="text-xl text-center mt-5 mb-5 text-gray-200">
          지금 바로 여러분의 사진과 입어보고 싶은 옷을 알려주세요.
          <br/>입어보신 사진을 보여드리겠습니다!
        </p>
      </section>

      {/* 이미지 업로드 및 결과 section */}
      <div className="max-w-[1440px] w-full p-10 mb-10 flex flex-col rounded-4xl bg-white shadow-xl">
        {/* 이미지 업로드 section */}
        <section className="flex flex-col lg:flex-row justify-around gap-5">
          
          <UploadCard 
            ref={userImageCardRef}
            title="여러분의 사진을 올려주세요" 
            icon={faFaceSmile} 
            image={userImage} 
            setImage={setUserImage}
          />
        
          <UploadCard 
            ref={clothImageCardRef}
            title="입어볼 옷 사진을 올려주세요" 
            icon={faShirt} 
            image={clothImage} 
            setImage={setClothImage}
          />

        </section>

        {
          !isLoading ? (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="min-w-[150px] text-[#A0A0FF] mt-10 hover:text-white hover:bg-[#A0A0FF]"
                onClick={getImage}
              >
                입어보기
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button disabled variant="outline" className="min-w-[150px] text-[#A0A0FF] mt-10 hover:text-white hover:bg-[#A0A0FF]">
                입어보는 중
                <Spinner className="size-4"></Spinner>
              </Button>
            </div>
          )
        }

        {/* 결과 이미지 section */}
        
        {
          resultImage && (
            <div className="flex flex-col items-center justify-center mt-10 overflow-auto">
                <img src={resultImage} alt="@IMG" className="object-contain w-1/2 h-[80%]"/>
                <div className="flex items-center gap-3 justify-around mt-3">
                  {/* ✅ 다운로드 버튼 */}
                  <a
                    href={resultImage}
                    download="가상피팅.png"
                  >
                    <Button
                      variant="outline"
                      className="flex items-center text-[#A0A0FF] hover:text-white hover:bg-[#A0A0FF]"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      다운로드
                    </Button>
                  </a>
                  {/* ✅ 새로 추가된 '다시 입어보기' 버튼 */}
                  <Button
                    variant="outline"
                    className="text-[#A0A0FF] hover:text-white hover:bg-[#A0A0FF]"
                    onClick={handleTryAgain}
                  >
                    다시 입어보기
                  </Button>

                  {/* ✅ 새로 추가된 '처음부터' 버튼 */}
                  <Button
                    variant="outline"
                    className="text-[#A0A0FF] hover:text-white hover:bg-[#A0A0FF]" // 다른 스타일 적용 (선택 사항)
                    onClick={handleStartOver}
                  >
                    처음부터
                  </Button>  
                </div>  
            </div>
          )
        }

      </div>
    </div>
  );
}
