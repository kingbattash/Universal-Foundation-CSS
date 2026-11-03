import * as stylex from "@stylexjs/stylex";
import {modularScale} from "@kingbattash/universal-foundation-css";
import {systemVars} from "../generated/stylex-vars.stylex";
import {lightTheme,darkTheme} from "../generated/stylex-theme.stylex";

const styles=stylex.create({
  shell:{minHeight:"100vh",padding:"clamp(20px,6vw,72px)",
    backgroundColor:systemVars.uiCanvas,color:systemVars.uiInk,fontFamily:systemVars.typographyBody},
  title:{fontFamily:systemVars.typographyHeading,fontSize:"clamp(36px,6vw,72px)",
    letterSpacing:"-0.045em",lineHeight:1.07,maxWidth:870,marginBottom:24},
  description:{maxWidth:620,fontSize:18,lineHeight:1.6,marginBottom:32},
  pane:{borderWidth:1,borderStyle:"solid",borderColor:systemVars.uiAction,
    borderRadius:systemVars.cornersCard,padding:systemVars.spacingComfortable},
  link:{color:systemVars.uiLink,textDecoration:"underline",textUnderlineOffset:"3px"},
  sample:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(250px,100%),1fr))",gap:24}
});
export default function Home(){
  return (
    <main {...stylex.props(lightTheme,styles.shell)}>
      <h1 {...stylex.props(styles.title)}>A design system that belongs to its creator.</h1>
      <p {...stylex.props(styles.description)}>
        This fictional editorial product is made using UF-CSS as a toolkit, not an imposed visual style.
        The package's math API is also available: modularScale(1) = {modularScale(1)}.
      </p>
      <div {...stylex.props(styles.sample)}>
        <section {...stylex.props(styles.pane)}>
          <h2>Custom light palette</h2>
          <p>Warm canvas, serif typography and project-defined spacing.</p>
          <a href="#dark-example" {...stylex.props(styles.link)}>View another color mode</a>
        </section>
        <section id="dark-example" {...stylex.props(darkTheme,styles.pane,styles.shell)}>
          <h2>Custom dark palette</h2>
          <p>Same token names; independently chosen mode values.</p>
        </section>
      </div>
    </main>
  );
}
