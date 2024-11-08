import { Button } from './ui/button'
import { Mic, MicOff } from "lucide-react"
import { motion } from 'framer-motion';

type Props = {
    isAudioOn: boolean,
    toggleAudio: () => void
}

const MicButton = (props: Props) => {
    return (
        <motion.div
            initial={ { marginRight: 0, borderRadius: 6 } }
            animate={ { marginRight: 10, borderRadius: 26 } }
            transition={ { ease: "linear", duration: 1 } }
            className="shrink-0"
        >
            <Button type="button" size="sm" onClick={ props.toggleAudio } className={props.isAudioOn ? 'outline-none ring-2 ring-ring ring-offset-2 animate-[glow_1.5s_ease-in-out_infinite]' : ''}>
                { props.isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" /> }
                <span className="sr-only">{ props.isAudioOn ? 'Turn off microphone' : 'Turn on microphone' }</span>
            </Button>
        </motion.div>
    )
}

export default MicButton