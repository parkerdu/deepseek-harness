/** Animated running indicator rendered above the active conversation composer. */
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './RunningAnt.module.css'

/** Props supplied by the session-scoped input dock. */
export type RunningAntProps = PropsRuntime<'conversation.input.dock'>

interface LegProps {
  tripod: 'tripodA' | 'tripodB'
  position: 'legFront' | 'legMiddle' | 'legRear'
  upper: string
  lower: string
  footX: number
  footY: number
}

/** One articulated leg assigned to one half of the alternating tripod gait. */
function Leg({ tripod, position, upper, lower, footX, footY }: LegProps) {
  return (
    <g className={`${css.leg} ${css[tripod]} ${css[position]}`}>
      <path d={upper} strokeWidth="3.5" />
      <path d={lower} strokeWidth="2.8" />
      <ellipse cx={footX} cy={footY} rx="3.5" ry="1.35" />
    </g>
  )
}

/** Rounded blue head based on the supplied ant-logo reference. */
function LogoHead() {
  return (
    <g>
      <path className={css.antennaOne} d="M27 20 C22 9 20 2 23 0 C27 -2 30 2 28 8 C27 12 27 16 27 20" />
      <path className={css.antennaTwo} d="M32 19 C34 9 37 1 42 0 C47 -1 48 4 44 8 C39 12 36 16 35 21" />
      <circle cx="29" cy="27" r="19" className={css.head} />
      <circle cx="32.5" cy="25" r="11.5" className={css.headRing} />
      <path d="M23 11 C28 8 36 9 41 13" className={css.headHighlight} />
    </g>
  )
}

/** Blue ant illustration with six visibly articulated legs. */
function BlueAnt() {
  return (
    <svg viewBox="0 -2 104 70" role="img" aria-label="正在爬行的蓝色蚂蚁">
      <g>
        <Leg tripod="tripodA" position="legFront" upper="M43 31 L31 43" lower="M31 43 L18 55" footX={18} footY={55} />
        <Leg tripod="tripodB" position="legMiddle" upper="M56 34 L53 48" lower="M53 48 L45 62" footX={45} footY={62} />
        <Leg tripod="tripodA" position="legRear" upper="M69 34 L78 46" lower="M78 46 L91 56" footX={91} footY={56} />
      </g>
      <g className={css.bodyGroup}>
        <LogoHead />
        <ellipse cx="53" cy="33" rx="10" ry="11" className={css.thorax} />
        <ellipse cx="76" cy="34" rx="20" ry="14" className={css.abdomen} />
        <path d="M61 28 C69 22 79 22 88 28" className={css.abdomenHighlight} />
      </g>
      <g>
        <Leg tripod="tripodB" position="legFront" upper="M43 35 L30 45" lower="M30 45 L15 48" footX={15} footY={48} />
        <Leg tripod="tripodA" position="legMiddle" upper="M56 37 L59 50" lower="M59 50 L57 64" footX={57} footY={64} />
        <Leg tripod="tripodB" position="legRear" upper="M69 37 L82 44" lower="M82 44 L98 48" footX={98} footY={48} />
      </g>
    </svg>
  )
}

/** Render the crawler only while the current conversation is running. */
export function RunningAnt({ useSession }: RunningAntProps) {
  const running = useSession(snapshot => snapshot.running)
  if (!running) return null
  return (
    <div className={css.track} aria-live="polite" data-running-ant>
      <div className={css.crawler}><BlueAnt /></div>
    </div>
  )
}
