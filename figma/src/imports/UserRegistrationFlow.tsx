import svgPaths from "./svg-h42wy0ohmw";
import clsx from "clsx";
import imgImagePpopDogMascot from "figma:asset/9f26dc55e04db8c579e04dae24b06c79413e09cd.png";
import imgImagePpop from "figma:asset/60c715ee26e73323f687236f871696c5d44ffe17.png";
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("absolute size-[19.985px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9848 19.9848">
        {children}
      </svg>
    </div>
  );
}

function Icon1Vector({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute inset-1/4">
      <div className="absolute inset-[-8.33%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3304 16.3304">
          {children}
        </svg>
      </div>
    </div>
  );
}

export default function UserRegistrationFlow() {
  return (
    <div className="bg-white relative size-full" data-name="User Registration Flow">
      <div className="absolute bg-white h-[851.376px] left-0 overflow-clip top-0 w-[393.647px]" data-name="Container">
        <div className="absolute content-stretch flex flex-col h-[771.458px] items-start left-0 overflow-clip top-[79.92px] w-[393.647px]" data-name="Main Content">
          <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[393.647px]" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[15.98px] px-[23.99px] relative rounded-[inherit] size-full">
              <div className="h-[643.498px] relative shrink-0 w-full" data-name="Container">
                <div className="absolute h-[277.171px] left-[7.99px] top-[31.98px] w-[329.688px]" data-name="Container">
                  <div className="absolute left-[90.57px] shadow-[0px_2px_16px_0px_rgba(0,0,0,0.15),0px_1px_6px_0px_rgba(0,0,0,0.25)] size-[148.557px] top-[-2.29px]" data-name="Image (ppop dog mascot)">
                    <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-contain pointer-events-none size-full" src={imgImagePpopDogMascot} />
                  </div>
                  <div className="absolute h-[41.236px] left-[16.02px] top-[125.12px] w-[297.728px]" data-name="Heading 2">
                    <div className="absolute content-stretch flex h-[36.618px] items-start left-[24.87px] top-[1.31px] w-[78.631px]" data-name="Text">
                      <p className="font-['Pretendard:SemiBold',sans-serif] leading-[41.25px] not-italic relative shrink-0 text-[#155dfc] text-[30px] text-center text-nowrap">PPOP</p>
                    </div>
                    <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[41.25px] left-[188.5px] not-italic text-[#101828] text-[30px] text-center top-[-0.69px] translate-x-[-50%] w-[170px]">하나로 모든걸</p>
                  </div>
                  <div className="absolute font-['Pretendard:Regular',sans-serif] h-[51.985px] leading-[26px] left-[16.02px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-[168.12px] w-[297.728px]" data-name="Paragraph">
                    <p className="absolute left-[148.89px] top-[-1.38px] translate-x-[-50%]">모든 인프라를 통합 아이디로</p>
                    <p className="absolute left-[149.12px] top-[24.61px] translate-x-[-50%]">한번에 이용해보세요.</p>
                  </div>
                </div>
                <div className="absolute content-stretch flex flex-col gap-[15.98px] h-[383.328px] items-start left-[8.01px] pb-0 pt-[24.991px] px-0 top-[267.1px] w-[329.688px]" data-name="Container">
                  <div className="content-stretch flex flex-col gap-[11.995px] h-[198.458px] items-start relative shrink-0 w-full" data-name="SocialLoginButtons">
                    <div className="bg-[#fee500] h-[55.949px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
                      <Wrapper additionalClassNames="left-[93.71px] top-[17.98px]">
                        <g clipPath="url(#clip0_19_654)" id="Icon">
                          <path d={svgPaths.p408a400} fill="var(--fill-0, #191919)" id="Vector" stroke="var(--stroke-0, #191919)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6654" />
                        </g>
                        <defs>
                          <clipPath id="clip0_19_654">
                            <rect fill="white" height="19.9848" width="19.9848" />
                          </clipPath>
                        </defs>
                      </Wrapper>
                      <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[24px] left-[179.19px] not-italic text-[#191919] text-[16px] text-center text-nowrap top-[14.29px] translate-x-[-50%]">카카오로 시작하기</p>
                    </div>
                    <div className="bg-[#03c75a] h-[59.954px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
                      <div className="absolute h-[27.995px] left-[97.35px] top-[15.98px] w-[12.69px]" data-name="SocialLoginButtons">
                        <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[28px] left-[6.5px] not-italic text-[18px] text-center text-nowrap text-white top-[-0.38px] translate-x-[-50%]">N</p>
                      </div>
                      <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[24px] left-[175.53px] not-italic text-[16px] text-center text-nowrap text-white top-[16.29px] translate-x-[-50%]">네이버로 시작하기</p>
                    </div>
                    <div className="bg-white h-[58.565px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
                      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[1.308px] border-solid inset-0 pointer-events-none rounded-[16px]" />
                      <Wrapper additionalClassNames="left-[100.62px] top-[19.29px]">
                        <g clipPath="url(#clip0_19_648)" id="SocialLoginButtons">
                          <path d={svgPaths.p2ddab00} fill="var(--fill-0, #4285F4)" id="Vector" />
                          <path d={svgPaths.p2dbdb200} fill="var(--fill-0, #34A853)" id="Vector_2" />
                          <path d={svgPaths.p20a20180} fill="var(--fill-0, #FBBC05)" id="Vector_3" />
                          <path d={svgPaths.p1471c700} fill="var(--fill-0, #EA4335)" id="Vector_4" />
                        </g>
                        <defs>
                          <clipPath id="clip0_19_648">
                            <rect fill="white" height="19.9848" width="19.9848" />
                          </clipPath>
                        </defs>
                      </Wrapper>
                      <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[24px] left-[179.09px] not-italic text-[#1e2939] text-[16px] text-center text-nowrap top-[15.6px] translate-x-[-50%]">구글로 시작하기</p>
                    </div>
                  </div>
                  <div className="h-[71.97px] relative shrink-0 w-full" data-name="Container">
                    <div className="absolute border-[#f3f4f6] border-[1.308px_0px_0px] border-solid h-[1.308px] left-0 top-[35.33px] w-[329.688px]" data-name="Text" />
                    <div className="absolute bg-white h-[23.99px] left-[139.01px] top-[23.99px] w-[51.638px]" data-name="Text">
                      <p className="absolute font-['Pretendard:Regular',sans-serif] leading-[24px] left-[11.99px] not-italic text-[#99a1af] text-[16px] text-nowrap top-[-1.69px]">또는</p>
                    </div>
                  </div>
                  <div className="bg-[#f9fafb] h-[55.949px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
                    <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[24px] left-[165.04px] not-italic text-[#4a5565] text-[16px] text-center text-nowrap top-[14.29px] translate-x-[-50%]">휴대폰 번호로 시작하기</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bg-white content-stretch flex h-[75.934px] items-center justify-between left-0 pl-[23.99px] pr-[16.021px] py-0 top-[3.98px] w-[393.647px]" data-name="Header">
          <div className="h-0 shrink-0 w-[39.99px]" data-name="Container" />
          <div className="h-[31.98px] relative shrink-0 w-[95.612px]" data-name="Image (ppop)">
            <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImagePpop} />
          </div>
          <div className="relative rounded-[4.38824e+07px] shrink-0 size-[43.975px]" data-name="Button">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[7.99px] px-[7.99px] relative size-full">
              <div className="h-[27.995px] overflow-clip relative shrink-0 w-full" data-name="Icon">
                <Icon1Vector>
                  <path d={svgPaths.p1876b080} id="Vector" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33292" />
                </Icon1Vector>
                <Icon1Vector>
                  <path d={svgPaths.p34572400} id="Vector" stroke="var(--stroke-0, #1E2939)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33292" />
                </Icon1Vector>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bg-[#f3f4f6] content-stretch flex flex-col h-[3.985px] items-start left-0 pl-0 pr-[393.647px] py-0 top-0 w-[393.647px]" data-name="ProgressBar">
          <div className="bg-[#155dfc] h-[3.985px] shrink-0 w-full" data-name="Container" />
        </div>
      </div>
    </div>
  );
}