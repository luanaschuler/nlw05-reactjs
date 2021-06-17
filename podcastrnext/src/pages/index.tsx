// SPA (useEffect - dispara algo sempre que algo mudar na aplicação - efeitos colaterais) 
//carregado somente no momento que a pessoa acessa a tela
//useEffect( () => {mudança}, [variavel q vai mudar]); se for [] vazio, ele muda assim que entrar em tela
//useEffect(() => {
//fetch('http://localhost:3333/episodes')
//.then(response => response.json())
//.then(data => console.log(data))
//}, [])
//problema: infos tem que estar disponivel assim que acessar a pagina, e nao quando renderiza

// SSR
//getServerSideProps exportado em qualquer pagina do pages, tem que ser função assincrona(async).
//Esse vai executar toda vez que alguem acessar a home da app. Mas se ela nao sofre alterações o tempo todo? 
//Sabendo que ela nao precisa buscar na API o tempo todo sendo que tem atualização baixa de podcvast
// SSG
//a pessoa acessa, e gera versão estatica dela (HTML puro) e é servido pra todos, nao interessa quantas, sempre acvessa mesma html, SEM PRECISAR FAZER REQUISIÇÃO o tempo todo. 
//Nao usa tanto recurso e fica mais perfomático
//Só trocar o getServerSideProps para getStaticProps

import { GetStaticProps } from 'next';
import { api } from '../services/api';
import Image from 'next/image'
import Link from 'next/link'
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { convertDurationTotimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';

type Episode = {
  id: string,
  title: string,
  members: string,
  thumbnail: string,
  duration: number,
  durationAsString: string,
  url: string,
  publishedAt: string,
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];  //ou assim Array<Episode>
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {

  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homePage}>
      <section className={styles.latestEpisodes}>

        <h2>Últimos Lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image width={192} height={192} src={episode.thumbnail} alt={episode.title} objectFit="cover" />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="play-green" />
                </button>
              </li>
            )
          })}
        </ul>

      </section>

      <section className={styles.allEpisodes}>

        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>  
              </tr>            
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => {
                return(
                  <tr key={episode.id}>
                    <td style={{ width: 72 }}>
                      <Image 
                        width={120} 
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>

                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                        <img src="/play-green.svg" alt="playpodcast"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
        </table>
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationTotimeString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })

  const latestEpisodes = episodes.slice(0, 2)
  const allEpisodes = episodes.slice(2, episodes.lenght)

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8, //hrs, a cada 8
  }
}

