//import { Inter } from '@next/font/google'
//const inter = Inter({ subsets: ['latin'] })
import ListItemButton from '@mui/material/ListItemButton'
import Container from '@mui/material/Container'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Image from 'next/image'
import NavBar from '@/components/navbar'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import { NextLinkComposed } from '@/components/link_composed'
import PraisingAppBar, { verticalPaddingAppBar } from '@/components/appbar'
import { filterArgomenti, filterMomenti, getLastRecentsSongs, getSingleSong } from '@/logic/local_logic'
import Routes from '@/logic/routes'
import ListSongs from '@/components/list_songs'


export default function Home() {
  const recentSongs = getLastRecentsSongs().map(id => getSingleSong(id)!)

  return (
    <Container disableGutters sx={{minHeight: '100vh'}}>
        <PraisingAppBar title='Home'/>
        <Typography variant="h2" sx={{pt: verticalPaddingAppBar*3 + 2, pl: 2 }}>
            Parti della messa
        </Typography>
        <List style={{ width: "100%", overflow: "auto", display: "flex" }} sx={{py: 2}}>
            {
                Object.keys(filterMomenti).map(momento => {
                    return (
                      <Container 
                        disableGutters 
                        key={momento} 
                        style={{ width: 200 }} 
                        sx={{mx: 0.5}}>
                        <ListItemButton 
                          LinkComponent={NextLinkComposed} 
                          href={Routes.FilteredSongs + '/' + momento} 
                          key={momento} 
                          style={{ width: 150, height: 75}} 
                          sx={{mx: 1, backgroundColor: '#F5DA81', borderRadius: 2}}
                        >
                            <ListItemText
                                disableTypography
                                primary={
                                <Typography textAlign="center" variant="h5">
                                  {filterMomenti[momento]}
                                </Typography>}
                            />
                        </ListItemButton>
                      </Container>
                    )
                })
            }
        </List>
        <Divider />
        <Typography variant="h2" sx={{pt: 2, pl: 2}}>
            Argomenti
        </Typography>
        <ImageList style={{ width: "100%", overflow: "auto", display: "flex" }} sx={{py: 2, pl: 2}}
        >
            {
                Object.keys(filterArgomenti).map(arg => {
                    return (
                        <ImageListItem 
                          component={NextLinkComposed} 
                          to={{pathname: Routes.FilteredSongs + '/' + arg}} 
                          key={arg} 
                          sx={{mx: 0.5, alignItems: 'center'}}>
                          <Image src={'/assets/Illustrazioni/' + filterArgomenti[arg] + '2.png'} alt="" width={100} height={100}/>
                          <Typography textAlign='center' variant="h5">
                            {filterArgomenti[arg]}
                          </Typography>
                        </ImageListItem>
                      )
                })
            }
            </ImageList>
        <Divider />
        {
          recentSongs.length > 0 && <Container sx={{pb: 7}}>
            <Typography variant="h2" sx={{pt: 2, pb: 2, pl: 2}}>
                Gli ultimi canti scelti
            </Typography>
            <ListSongs 
              songs={recentSongs}
              mode='normal'
              withSearch={false}
            />
          </Container>
        }
        <NavBar />
    </Container>
  )
  
}