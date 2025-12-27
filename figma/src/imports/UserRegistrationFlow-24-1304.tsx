import svgPaths from "./svg-ahal8c1puu";
import clsx from "clsx";
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
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="basis-0 grow h-[63.939px] min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center overflow-clip px-0 py-[16px] relative rounded-[inherit] size-full">
        <p className="font-['Pretendard:SemiBold',sans-serif] leading-[32px] not-italic relative shrink-0 text-[#101828] text-[24px] text-nowrap">{text}</p>
      </div>
    </div>
  );
}

export default function UserRegistrationFlow() {
  return (
    <div className="bg-white relative size-full" data-name="User Registration Flow">
      <div className="absolute bg-white h-[851.376px] left-0 overflow-clip top-0 w-[393.647px]" data-name="Container">
        <div className="absolute content-stretch flex flex-col items-start left-0 overflow-clip top-[79.92px] w-[393.647px]" data-name="Main Content">
          <div className="h-[771.458px] relative shrink-0 w-[393.647px]" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[15.98px] px-[23.99px] relative rounded-[inherit] size-full">
              <div className="h-[369px] relative shrink-0 w-full" data-name="Container">
                <div className="size-full">
                  <div className="content-stretch flex flex-col items-start justify-between pb-[-238.203px] pl-[7.99px] pr-0 pt-[7.99px] relative size-full">
                    <div className="h-[373px] relative shrink-0 w-[330px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                        <div className="absolute h-[40.991px] left-[36.02px] top-[29.11px] w-[256.287px]" data-name="Heading 2">
                          <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[41px] left-[128.5px] not-italic text-[#101828] text-[30px] text-center text-nowrap top-[-0.69px] translate-x-[-50%]">다시 만나서 반가워요!</p>
                        </div>
                        <div className="absolute h-[25.992px] left-[55.02px] top-[70.11px] w-[222.612px]" data-name="Paragraph">
                          <p className="absolute font-['Pretendard:Regular',sans-serif] leading-[26px] left-[111.5px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-[-1.38px] translate-x-[-50%]">PPOP 통합 계정으로 로그인하세요.</p>
                        </div>
                        <div className="absolute content-stretch flex flex-col gap-[31.98px] h-[218.443px] items-start left-[17.02px] top-[155.11px] w-[297.728px]" data-name="Container">
                          <div className="h-[65.247px] relative shrink-0 w-full" data-name="FloatingInput">
                            <div className="absolute content-stretch flex h-[65.247px] items-center left-0 pb-[1.308px] pt-0 px-0 top-0 w-[297.728px]" data-name="Container">
                              <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0px_0px_1.308px] border-solid inset-0 pointer-events-none" />
                              <Text text="heishi!@naver.com" />
                            </div>
                            <div className="absolute h-[23.796px] left-0 top-[-16.01px] w-[69.841px]" data-name="Label">
                              <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[28px] left-[35.5px] not-italic text-[#99a1af] text-[18px] text-center text-nowrap top-[-0.78px] translate-x-[-50%]">이메일 주소</p>
                            </div>
                          </div>
                          <div className="h-[65.247px] relative shrink-0 w-full" data-name="FloatingInput">
                            <div className="absolute content-stretch flex h-[65.247px] items-center left-0 pb-[1.308px] pt-0 px-0 top-0 w-[297.728px]" data-name="Container">
                              <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0px_0px_1.308px] border-solid inset-0 pointer-events-none" />
                              <Text text="ddsfasdsfdsf" />
                            </div>
                            <div className="absolute h-[23.796px] left-0 top-[-16.01px] w-[52.889px]" data-name="Label">
                              <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[28px] left-[26.5px] not-italic text-[#99a1af] text-[18px] text-center text-nowrap top-[-0.78px] translate-x-[-50%]">비밀번호</p>
                            </div>
                          </div>
                          <div className="h-[23.99px] relative shrink-0 w-full" data-name="Container">
                            <div className="flex flex-row items-center size-full">
                              <div className="content-stretch flex items-center justify-between px-[3.985px] py-0 relative size-full">
                                <div className="h-[23.99px] relative shrink-0 w-[97.002px]" data-name="Label">
                                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.99px] items-center relative size-full">
                                    <div className="shrink-0 size-[15.98px]" data-name="Checkbox" />
                                    <div className="basis-0 grow h-[23.99px] min-h-px min-w-px relative shrink-0" data-name="Text">
                                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                        <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[37px] not-italic text-[#6a7282] text-[16px] text-center text-nowrap top-[-1.69px] translate-x-[-50%]">로그인 유지</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="h-[23.99px] relative shrink-0 w-[86.846px]" data-name="Button">
                                  <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                                    <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[43.5px] not-italic text-[#99a1af] text-[16px] text-center text-nowrap top-[-1.69px] translate-x-[-50%]">비밀번호 찾기</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-[277px] relative shrink-0 w-[330px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24.991px] items-start relative size-full">
                        <div className="h-[72px] relative shrink-0 w-full" data-name="Container">
                          <div className="absolute border-[#f3f4f6] border-[1.308px_0px_0px] border-solid h-[1.308px] left-0 top-[35.33px] w-[329.688px]" data-name="Text" />
                          <div className="absolute bg-white h-[23.99px] left-[139.01px] top-[23.99px] w-[51.638px]" data-name="Text">
                            <p className="absolute font-['Pretendard:Regular',sans-serif] leading-[24px] left-[11.99px] not-italic text-[#99a1af] text-[16px] text-nowrap top-[-1.69px]">또는</p>
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col gap-[11.995px] h-[198.458px] items-start relative shrink-0 w-full" data-name="SocialLoginButtons">
                          <div className="bg-[#fee500] h-[55.949px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
                            <Wrapper additionalClassNames="left-[98.02px] top-[17.78px]">
                              <g clipPath="url(#clip0_24_1308)" id="Icon">
                                <path d={svgPaths.p3cbc5000} fill="var(--fill-0, #191919)" id="Vector" stroke="var(--stroke-0, #191919)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6654" />
                              </g>
                              <defs>
                                <clipPath id="clip0_24_1308">
                                  <rect fill="white" height="19.9848" width="19.9848" />
                                </clipPath>
                              </defs>
                            </Wrapper>
                            <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[24px] left-[181.83px] not-italic text-[#191919] text-[16px] text-center text-nowrap top-[15.78px] translate-x-[-50%]">카카오로 로그인</p>
                          </div>
                          <div className="bg-[#03c75a] h-[59.954px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
                            <div className="absolute h-[27.995px] left-[97.35px] top-[15.98px] w-[12.69px]" data-name="SocialLoginButtons">
                              <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[28px] left-[6.5px] not-italic text-[18px] text-center text-nowrap text-white top-[-0.38px] translate-x-[-50%]">N</p>
                            </div>
                            <p className="absolute font-['Pretendard:SemiBold',sans-serif] leading-[24px] left-[175.53px] not-italic text-[16px] text-center text-nowrap text-white top-[16.29px] translate-x-[-50%]">네이버로 로그인</p>
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
                        <div className="h-[52.945px] relative shrink-0 w-full" data-name="Button">
                          <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[21px] left-[136.52px] not-italic text-[#99a1af] text-[14px] text-center text-nowrap top-[1.67px] translate-x-[-50%]">아직 계정이 없으신가요?</p>
                          <div className="absolute content-stretch flex h-[17.001px] items-start left-[209.2px] top-[1.67px] w-[48.389px]" data-name="Text">
                            <p className="font-['Pretendard:SemiBold',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#155dfc] text-[14px] text-center text-nowrap">회원가입</p>
                          </div>
                        </div>
                      </div>
                    </div>
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
        <div className="absolute bg-[#f3f4f6] content-stretch flex flex-col h-[3.985px] items-start left-0 pl-0 pr-[-43.729px] py-0 top-0 w-[393.647px]" data-name="ProgressBar">
          <div className="bg-[#155dfc] h-[3.985px] shrink-0 w-full" data-name="Container" />
        </div>
      </div>
    </div>
  );
}