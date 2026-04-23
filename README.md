# Frank

![Logo du projet](images/logo_transparent.png)

The goal of this project, named **Frank**, is to build an application that allows users to create and display slide presentations similar to PowerPoint or Keynote, but where the content is defined using a Markdown and a CSS. The application is designed with features that are particularly useful for developers.

These features include:
- **Displaying code snippets** within slides, with automatic scrolling when the code is longer than the available space (or without scrolling if the code fits). The code can be written directly in the slide or loaded from separate files.
- **Executing commands** directly from a slide.

### File Architecture
```
my-file/ 
├── presentation.md
├── config.json
├── style.css
├── assets/
│ └── image files
└── env/
  ├── exe files
  └── code files 
```


### Collaborator
[Aurelien DUGAST](https://github.com/LaNuggets/) and [Cassian JOLY](https://github.com/Cassian-J)


# idée
pré-requis :
- marquage des pages + id(avec interupteur dans le menu)
- quand on clique sur un chiffre pour aller directement sur la page (ex : on appuie sur 7 ça va a la slide 7 directement) (ex : alt + chiffre)

technique :
- pouvoir voir la présentation en temps réel quand on modifie le markdown (de la page)
- zoom static
- ajout de markdown personaliser (enregistrement en html mais affichage en personalisé)

visuel :
- avoir un theme par defaut (puis si possible pouvoir changer le thème)
- pouvoir re-size une image/vidéo/import de fichier en direct
- transition
