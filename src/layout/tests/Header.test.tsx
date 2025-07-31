import { render } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Header from "../Header";
import { AuthProvider } from "@/components/auth/AuthProvider";

vi.mock("@/hooks/useProjectStore", ()=>({
  useProjectStore: ()=>({ projects:[{id:"p1",name:"Test"}], loading:false })
}));
vi.mock("@/hooks/useScenarioStore", ()=>({
  useScenarioStore: ()=>
    ({ scenarios:[{id:"s1",name:"Base"}], current:null,
       setCurrent:vi.fn(), create:vi.fn(), loading:false })
}));

describe("Header", () => {
  test("renders project & scenario buttons", ()=>{
    const { getByRole } = render(<AuthProvider><Header/></AuthProvider>);
    expect(getByRole("button",{name:/select project/i})).toBeInTheDocument();
    expect(getByRole("button",{name:/select scenario/i})).toBeInTheDocument();
  });
});