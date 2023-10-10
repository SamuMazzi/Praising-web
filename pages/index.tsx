import React, { useEffect, useState } from 'react';
import {createBrowserRouter, Outlet, RouterProvider} from 'react-router-dom';
import SongsPage from './songs'
import Lectures from './lectures'
import PlaylistPage from './playlist'
import EmptyFilterPage from './songs/filter'
import SongPage, { loaderSongPage } from './songs/[id]'
import FilterPage, { loaderFilterPage } from './songs/filter/[filter]'
import PlaylisSharedPage, { loaderPlaylistSharedPage } from './playlist/shared'
import SinglePlaylistPage, { loaderSinglePlaylistPage } from './playlist/[id]'
import Home from './home';
import NavBar from '@/components/navbar';

const NavbarWrapper = () => {
  return (
  <div>
      <Outlet/>
      <NavBar/>
  </div>
  )
};

export default function App() {
  const [router, setRouter] = useState<any>()

  useEffect(() => {
    const router = createBrowserRouter([
      {
        path: "/",
        element: <NavbarWrapper />,
        children: [
          {
            path: "/",
            index: true,
            element: <Home />
          },
          {
            path: "/lectures",
            element: <Lectures />
          },
          {
            path: "/songs",
            children: [
              {
                index: true,
                element: <SongsPage />,
              },
              {
                path: ":id",
                element: <SongPage />,
                loader: loaderSongPage
              },
              {
                path: "filter",
                element: <EmptyFilterPage />,
                children: [
                  {
                    path: ":filter",
                    element: <FilterPage />,
                    loader: loaderFilterPage
                  }
                ]
              }
            ]
          },
          {
            path: "/playlist",
            children: [
              {
                index: true,
                element: <PlaylistPage />,
              },
              {
                path: ":id",
                element: <SinglePlaylistPage />,
                loader: loaderSinglePlaylistPage
              },
              {
                path: "shared",
                element: <PlaylisSharedPage />,
                loader: loaderPlaylistSharedPage
              }
            ]
          },
        ]
      }
    ]);
    setRouter(router)
  }, [])

  return router ? <RouterProvider router={router}/> : null;
}