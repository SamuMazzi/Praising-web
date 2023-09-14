import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"

interface PropsRenderActualSong {
    fontSize: number | undefined
    songHtml: string
}

export const RenderActualSong = (props: PropsRenderActualSong) => {
    return (
        <Container disableGutters sx={{py: 1}}>
            <Typography style={{fontSize: props.fontSize ?? 17}}>
                <div dangerouslySetInnerHTML={{__html: props.songHtml}} />
            </Typography>
        </Container>
    )
}